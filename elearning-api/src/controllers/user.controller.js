const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all courses (with enrollment status if applicable)
const getCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        enrollments: {
          where: { userId }
        }
      }
    });

    const formattedCourses = courses.map(course => {
      const enrollment = course.enrollments[0];
      return {
        ...course,
        enrollments: undefined,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment ? enrollment.status : null,
        progressPercent: enrollment ? enrollment.progressPercent : 0,
        completedAt: enrollment ? enrollment.completedAt : null
      };
    });

    res.json(formattedCourses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    const dataToUpdate = {};
    
    if (currentPassword && newPassword) {
      const bcrypt = require('bcrypt');
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }
    
    let updatedUser;
    if (Object.keys(dataToUpdate).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: { id: true, name: true, email: true, role: true, department: true }
      });
    } else {
      updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, department: true }
      });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single course details
const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            progress: {
              where: { userId }
            },
            questions: {
              include: {
                choices: { select: { id: true, questionId: true, text: true } }
              },
              orderBy: { order: 'asc' }
            },
            quizAttempts: {
              where: { userId },
              orderBy: { score: 'desc' },
              take: 1
            }
          }
        },
        enrollments: {
          where: { userId }
        }
      }
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = course.enrollments[0];
    const formattedCourse = {
      ...course,
      enrollments: undefined,
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment ? enrollment.status : null,
      progressPercent: enrollment ? enrollment.progressPercent : 0,
      lessons: course.lessons.map(lesson => ({
        ...lesson,
        progress: undefined,
        userProgress: lesson.progress[0]?.progress || 0,
        isCompleted: lesson.progress[0]?.progress === 100,
        lastAttempt: lesson.quizAttempts?.[0] || null
      }))
    };

    res.json(formattedCourse);
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enroll in a course
const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if already enrolled
    const existing = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId, courseId: id } }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.userCourse.create({
      data: {
        userId,
        courseId: id,
        status: 'IN_PROGRESS',
        progressPercent: 0
      }
    });

    res.status(201).json({ message: 'Successfully enrolled', enrollment });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update lesson progress and handle points
const updateLessonProgress = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const { progress } = req.body; // 0 to 100
    const userId = req.user.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Check if user is enrolled
    const enrollment = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } }
    });

    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    // Upsert lesson progress
    const isCompleted = progress === 100;
    const lessonProgress = await prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        progress,
        lastSeenAt: new Date(),
        completedAt: isCompleted ? new Date() : null
      },
      create: {
        userId,
        lessonId,
        progress,
        completedAt: isCompleted ? new Date() : null
      }
    });

    // If lesson is just completed, check if course is completed
    if (isCompleted && enrollment.status !== 'COMPLETED') {
      const allLessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId } });
      const completedLessons = await prisma.userLessonProgress.findMany({
        where: { userId, lessonId: { in: allLessons.map(l => l.id) }, progress: 100 }
      });

      const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);

      const updateData = { progressPercent: newProgressPercent };
      if (newProgressPercent === 100) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();

        // Award points for completing the course
        if (lesson.course.points > 0) {
          await prisma.pointsLedger.create({
            data: {
              userId,
              sourceType: 'course',
              sourceId: lesson.courseId,
              points: lesson.course.points,
              note: `Completed course: ${lesson.course.title}`
            }
          });
        }
      }

      await prisma.userCourse.update({
        where: { id: enrollment.id },
        data: updateData
      });
    }

    res.json({ message: 'Progress updated', progress: lessonProgress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit Quiz Answers
const submitQuiz = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const { answers } = req.body; // { questionId: choiceId, ... }
    const userId = req.user.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
        questions: { include: { choices: true } }
      }
    });

    if (!lesson || lesson.type !== 'quiz') {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const correctAnswers = {};
    
    lesson.questions.forEach(q => {
      totalPoints += q.points;
      const userChoiceId = answers[q.id];
      const correctChoice = q.choices.find(c => c.isCorrect);
      
      if (correctChoice) {
        correctAnswers[q.id] = correctChoice.id;
        if (correctChoice.id === userChoiceId) {
          score += q.points;
        }
      }
    });

    const passScore = lesson.passScore || 60; // Default 60%
    const scorePercent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 100;
    const passed = scorePercent >= passScore;

    // Check if user has already passed this lesson earlier
    const previousPass = await prisma.quizAttempt.findFirst({
      where: { userId, lessonId, status: 'PASSED' }
    });

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        lessonId,
        score: scorePercent,
        status: passed ? 'PASSED' : 'FAILED'
      }
    });

    const isCompleted = passed && !previousPass;

    if (isCompleted) {
      await prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { progress: 100, lastSeenAt: new Date(), completedAt: new Date() },
        create: { userId, lessonId, progress: 100, completedAt: new Date() }
      });
      
      const enrollment = await prisma.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } }
      });
      
      if (enrollment && enrollment.status !== 'COMPLETED') {
        const allLessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId } });
        const completedLessons = await prisma.userLessonProgress.findMany({
          where: { userId, lessonId: { in: allLessons.map(l => l.id) }, progress: 100 }
        });
        
        const newProgressPercent = Math.round((completedLessons.length / allLessons.length) * 100);
        const updateData = { progressPercent: newProgressPercent };
        
        if (newProgressPercent === 100) {
          updateData.status = 'COMPLETED';
          updateData.completedAt = new Date();
          
          if (lesson.course.points > 0) {
            const existingPoints = await prisma.pointsLedger.findFirst({
              where: { userId, sourceType: 'course', sourceId: lesson.courseId }
            });
            if (!existingPoints) {
              await prisma.pointsLedger.create({
                data: {
                  userId,
                  sourceType: 'course',
                  sourceId: lesson.courseId,
                  points: lesson.course.points,
                  note: `Completed course: ${lesson.course.title}`
                }
              });
            }
          }
        }
        await prisma.userCourse.update({ where: { id: enrollment.id }, data: updateData });
      }
    }

    res.json({ attempt, score, scorePercent, passed, isCompleted, passScore, correctAnswers });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user points balance and history
const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ledger = await prisma.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const balance = ledger.reduce((acc, curr) => acc + curr.points, 0);

    res.json({ balance, history: ledger });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get rewards catalog
const getRewards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rewards = await prisma.reward.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { pointsCost: 'asc' }
    });
    
    // Check how many times user has redeemed each
    const userRequests = await prisma.redeemRequest.groupBy({
       by: ['rewardId'],
       where: { userId, status: { not: 'REJECTED' } },
       _count: { id: true }
    });
    
    const countMap = {};
    userRequests.forEach(r => countMap[r.rewardId] = r._count.id);

    const data = rewards.map(r => ({
      ...r,
      userRedeemedCount: countMap[r.id] || 0
    }));

    res.json(data);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Redeem a reward
const requestRedeem = async (req, res) => {
  try {
    const { id: rewardId } = req.params;
    const userId = req.user.userId;

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.status !== 'ACTIVE' || reward.stock <= 0) {
      return res.status(400).json({ message: 'Reward unavailable or out of stock' });
    }

    // Check limits
    const userRedeemed = await prisma.redeemRequest.count({
      where: { userId, rewardId, status: { not: 'REJECTED' } }
    });
    if (userRedeemed >= reward.maxPerUser) {
      return res.status(400).json({ message: 'คุณแลกรางวัลนี้ครบตามสิทธิที่กำหนดแล้ว' });
    }

    // Check balance
    const ledger = await prisma.pointsLedger.findMany({ where: { userId } });
    const balance = ledger.reduce((acc, curr) => acc + curr.points, 0);

    if (balance < reward.pointsCost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Process transaction (Create request + Deduct points)
    const transaction = await prisma.$transaction(async (prisma) => {
      const request = await prisma.redeemRequest.create({
        data: {
          userId,
          rewardId,
          pointsCost: reward.pointsCost
        }
      });

      await prisma.pointsLedger.create({
        data: {
          userId,
          sourceType: 'redeem',
          sourceId: request.id,
          points: -reward.pointsCost,
          note: `Redeemed: ${reward.name}`
        }
      });

      await prisma.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } }
      });

      return request;
    });

    res.status(201).json({ message: 'Redeem request submitted successfully', request: transaction });
  } catch (error) {
    console.error('Redeem error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all categories for filtering
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCourses,
  getCourseDetails,
  enrollCourse,
  updateLessonProgress,
  getPointsHistory,
  getRewards,
  requestRedeem,
  getCategories,
  submitQuiz,
  updateProfile
};
