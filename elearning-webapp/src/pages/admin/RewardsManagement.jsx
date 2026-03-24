import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, ImageIcon } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

const RewardsManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', pointsCost: 100, stock: 10, maxPerUser: 1, image: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await adminAPI.getRewards();
      setRewards(response.data);
    } catch (error) {
      console.error('Fetch rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await adminAPI.uploadFile(file);
      setNewReward({ ...newReward, image: res.data.fileUrl });
    } catch (err) {
      console.error(err);
      alert('อัปโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminAPI.updateReward(editingId, { ...newReward });
        alert('อัปเดตของรางวัลสำเร็จ!');
      } else {
        await adminAPI.createReward({ ...newReward, status: 'ACTIVE' });
        alert('เพิ่มของรางวัลสำเร็จ!');
      }
      closeModal();
      fetchRewards();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setNewReward({ name: '', pointsCost: 100, stock: 10, maxPerUser: 1, image: '' });
  };

  const openEdit = (reward) => {
    setIsEditing(true);
    setEditingId(reward.id);
    setNewReward({ name: reward.name, pointsCost: reward.pointsCost, stock: reward.stock, maxPerUser: reward.maxPerUser || 1, image: reward.image || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(confirm('ยืนยันการลบของรางวัล?')) {
        try {
            await adminAPI.deleteReward(id);
            setRewards(rewards.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('ลบไม่สำเร็จ');
        }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold mb-1">จัดการของรางวัล</h2>
          <p className="text-muted text-sm">จัดการรายการของรางวัลในระบบ</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> เพิ่มของรางวัล
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="card bg-white w-full max-w-md p-6 shadow-xl">
               <h3 className="text-xl font-bold mb-4">{isEditing ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัลใหม่'}</h3>
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">รูปภาพของรางวัล</label>
                    <div className="flex items-center gap-4">
                      {newReward.image && newReward.image.includes('/') ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border shrink-0">
                          <img src={getFullUrl(newReward.image)} className="w-full h-full object-cover" alt="preview"/>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          id="rewardImage"
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <label 
                          htmlFor="rewardImage" 
                          className="btn btn-outline py-1.5 px-3 text-sm cursor-pointer whitespace-nowrap flex w-fit items-center gap-2"
                        >
                          <Upload size={14} /> {uploadingImage ? 'อัปโหลด...' : 'เปลี่ยนรูปภาพ'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">ชื่อของรางวัล</label>
                    <input 
                      required
                      type="text" 
                      className="form-input w-full" 
                      placeholder="เช่น บัตรกำนัล Starbucks"
                      value={newReward.name}
                      onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">แต้มที่ใช้แลก</label>
                    <input 
                      required
                      type="number" 
                      className="form-input w-full"
                      value={newReward.pointsCost}
                      onChange={(e) => setNewReward({...newReward, pointsCost: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">จำนวนคงเหลือ (Stock)</label>
                    <input 
                      type="number" 
                      className="form-input w-full" 
                      value={newReward.stock}
                      onChange={(e) => setNewReward({...newReward, stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">จำกัดสิทธิต่อคน (ครั้ง)</label>
                    <input 
                      type="number" 
                      className="form-input w-full" 
                      value={newReward.maxPerUser}
                      min="1"
                      onChange={(e) => setNewReward({...newReward, maxPerUser: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={closeModal} className="btn btn-outline flex-1">ยกเลิก</button>
                    <button type="submit" disabled={uploadingImage} className="btn btn-primary flex-1">บันทึก</button>
                  </div>
               </form>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {loading ? (
             <div className="col-span-full flex items-center justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
        ) : rewards.length === 0 ? (
             <div className="col-span-full text-center p-8 text-muted border border-dashed rounded-xl border-border">ยังไม่มีของรางวัลในระบบ</div>
        ) : rewards.map((reward) => (
          <div key={reward.id} className={`card p-5 ${reward.stock === 0 ? 'bg-gray-50' : 'bg-surface'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`badge ${reward.stock > 0 ? 'badge-success' : 'bg-gray-200 text-gray-700'}`}>
                {reward.stock > 0 ? 'Active' : 'หมดสต๊อก'}
              </span>
              <div className="flex gap-1 text-muted">
                 <button onClick={() => openEdit(reward)} className="hover:text-primary"><Edit size={16}/></button>
                 <button onClick={() => handleDelete(reward.id)} className="hover:text-danger"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="flex gap-3 items-center mb-3">
              {reward.image && reward.image.includes('/') ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img src={getFullUrl(reward.image)} alt="Reward" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-indigo-400" />
                </div>
              )}
              <h3 className="font-bold text-base leading-snug">{reward.name}</h3>
            </div>
            
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted mb-0.5">แต้มที่ใช้</p>
                <p className="font-bold text-warning">{reward.pointsCost} Pts</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-0.5">คงเหลือ</p>
                <p className={`font-bold ${reward.stock === 0 ? 'text-danger' : 'text-primary'}`}>
                  {reward.stock}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsManagement;
