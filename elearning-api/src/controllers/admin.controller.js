const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// DASHBOARD
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    const totalCourses = await prisma.course.count();
    const activeEnrollments = await prisma.userCourse.count({ where: { status: 'IN_PROGRESS' } });
    
    // Get popular courses
    const popularCourses = await prisma.course.findMany({
      take: 3,
      include: {
        _count: { select: { enrollments: true } }
      },
      orderBy: {
        enrollments: { _count: 'desc' }
      }
    });

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments: activeEnrollments,
      popularCourses: popularCourses.map(c => ({
        id: c.id,
        title: c.title,
        students: c._count.enrollments,
        completionRate: '100%' // Placeholder for now
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// USERS
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      include: {
        _count: { select: { enrollments: { where: { status: 'COMPLETED' } } } }
      },
      orderBy: { pointsBalance: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// COURSES
const getAdminCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { category: true, _count: { select: { enrollments: true, lessons: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, categoryId, points, status, image } = req.body;
    const course = await prisma.course.create({
      data: { title, description, categoryId, points, status, image }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const course = await prisma.course.update({
      where: { id },
      data
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    const category = await prisma.category.create({ data: { name, order } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// REWARDS
const getAdminRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createReward = async (req, res) => {
  try {
    const { name, pointsCost, stock, maxPerUser, status, image } = req.body;
    const reward = await prisma.reward.create({
      data: { 
        name, 
        pointsCost: parseInt(pointsCost), 
        stock: parseInt(stock), 
        maxPerUser: maxPerUser !== undefined ? parseInt(maxPerUser) : 1,
        status, 
        image 
      }
    });
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateReward = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.maxPerUser !== undefined) data.maxPerUser = parseInt(data.maxPerUser);
    if (data.pointsCost !== undefined) data.pointsCost = parseInt(data.pointsCost);
    if (data.stock !== undefined) data.stock = parseInt(data.stock);
    const reward = await prisma.reward.update({ where: { id }, data });
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// REDEEMS
const getRedeemRequests = async (req, res) => {
  try {
    const requests = await prisma.redeemRequest.findMany({
      include: { user: { select: { name: true, email: true } }, reward: true },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRedeemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    
    // Validate bounds
    if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await prisma.redeemRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await prisma.$transaction(async (prisma) => {
      // If rejected, refund points and restore stock
      if (status === 'REJECTED' && request.status !== 'REJECTED') {
        await prisma.pointsLedger.create({
          data: {
            userId: request.userId,
            sourceType: 'reward_adjust',
            sourceId: request.id,
            points: request.pointsCost,
            note: `Refund for rejected redeem: ${id}`
          }
        });

        await prisma.reward.update({
          where: { id: request.rewardId },
          data: { stock: { increment: 1 } }
        });
      }

      await prisma.redeemRequest.update({
        where: { id },
        data: { status, adminNote, updatedAt: new Date() }
      });
    });

    res.json({ message: `Request ${status}` });
  } catch (error) {
    console.error('Update redeem error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: USER MANAGEMENT (ADD/EDIT)
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, pointsBalance } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        department,
        pointsBalance: pointsBalance || 0
      }
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, pointsBalance, ...data } = req.body;
    
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.$transaction(async (tx) => {
      // If admin is updating points, handle the ledger diff
      if (pointsBalance !== undefined) {
        const newBalance = parseInt(pointsBalance, 10);
        
        // Calculate current actual balance
        const ledger = await tx.pointsLedger.findMany({ where: { userId: id } });
        const currentBalance = ledger.reduce((acc, curr) => acc + curr.points, 0);
        
        const diff = newBalance - currentBalance;
        if (diff !== 0) {
          await tx.pointsLedger.create({
            data: {
               userId: id,
               sourceType: 'admin_edit',
               points: diff,
               note: `Admin adjusted balance by ${diff} (Target: ${newBalance})`
            }
          });
        }
        data.pointsBalance = newBalance; // Keep the User record sync'd just in case
      }

      const user = await tx.user.update({
        where: { id },
        data
      });
      res.json(user);
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting your own account
    if (req.user.userId === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: CATEGORY MANAGEMENT (UPDATE/DELETE)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, order }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: This might fail if courses exist under this category depending on Prisma constraints
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error (check if courses exist in this category)' });
  }
};

// --- LESSON MANAGEMENT ---

const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lessons' });
  }
};

const createLesson = async (req, res) => {
  try {
    const { courseId, title, type, contentUrl, content, duration, order, points, passScore, questions } = req.body;
    
    const lessonData = {
      courseId,
      title,
      type,
      contentUrl,
      content,
      duration,
      order: parseInt(order) || 0,
      points: parseInt(points) || 0,
      passScore: parseInt(passScore) || 0
    };

    if (type === 'quiz' && questions && questions.length > 0) {
      lessonData.questions = {
        create: questions.map((q, idx) => ({
          text: q.text,
          order: idx,
          points: parseInt(q.points) || 1,
          choices: {
            create: q.choices.map(c => ({
              text: c.text,
              isCorrect: !!c.isCorrect
            }))
          }
        }))
      };
    }

    const lesson = await prisma.lesson.create({
      data: lessonData,
      include: { questions: { include: { choices: true } } }
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, contentUrl, content, duration, order, points, passScore, questions } = req.body;
    
    // If it's a quiz, delete previous questions and recreate
    if (type === 'quiz') {
      await prisma.question.deleteMany({ where: { lessonId: id } });
    }

    const lessonData = {
      title,
      type,
      contentUrl,
      content,
      duration,
      order: parseInt(order) || 0,
      points: parseInt(points) || 0,
      passScore: parseInt(passScore) || 0
    };

    if (type === 'quiz' && questions && questions.length > 0) {
      lessonData.questions = {
        create: questions.map((q, idx) => ({
          text: q.text,
          order: idx,
          points: parseInt(q.points) || 1,
          choices: {
            create: q.choices.map(c => ({
              text: c.text,
              isCorrect: !!c.isCorrect
            }))
          }
        }))
      };
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: lessonData,
      include: { questions: { include: { choices: true } } }
    });
    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lesson.delete({ where: { id } });
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: QUIZ REPORTS
const getCourseQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        lesson: {
          courseId: courseId
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
        lesson: { select: { id: true, title: true, passScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(attempts);
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminRewards,
  createReward,
  updateReward,
  getRedeemRequests,
  updateRedeemStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseQuizAttempts
};
