import React, { useState, useEffect } from 'react';
import { Gift, Zap, Ticket, Coffee, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../utils/api';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

const iconMap = {
  coffee: <Coffee className="text-green-600" size={32} strokeWidth={1.5}/>,
  ticket: <Ticket className="text-red-600" size={32} strokeWidth={1.5}/>,
  food: <Zap className="text-green-500" size={32} strokeWidth={1.5}/>,
  voucher: <Gift className="text-orange-500" size={32} strokeWidth={1.5}/>,
  default: <Gift className="text-primary" size={32} strokeWidth={1.5}/>
};

const bgMap = {
  coffee: 'bg-green-50',
  ticket: 'bg-red-50',
  food: 'bg-green-50',
  voucher: 'bg-orange-50',
  default: 'bg-indigo-50'
};

const Rewards = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointsRes, rewardsRes] = await Promise.all([
        userAPI.getPoints(),
        userAPI.getRewards()
      ]);
      setPoints(pointsRes.data.balance);
      setHistory(pointsRes.data.history);
      setRewards(rewardsRes.data);
    } catch (error) {
      console.error('Fetch rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId, cost, max, userRedeemed) => {
    if (points < cost) return alert('แต้มไม่พอ');
    if (userRedeemed >= max) return alert('สิทธิของคุณเต็มแล้ว');
    if (confirm('ยืนยันการแลกของรางวัล?')) {
      try {
        setRedeeming(true);
        await userAPI.requestRedeem(rewardId);
        alert('ส่งคำร้องขอแลกของรางวัลสำเร็จ โปรดรอแอดมินอนุมัติ');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Redeem error:', error);
        alert(error.response?.data?.message || 'การแลกรางวัลล้มเหลว');
      } finally {
        setRedeeming(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-8 pt-2">
      
      {/* Points Card */}
      <div className="bg-gradient-primary rounded-[1.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col items-center">
        {/* Background blobs for premium effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[40px] transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[mix-blend-mode:overlay] bg-indigo-400/30 rounded-full blur-[30px] transform -translate-x-1/2 translate-y-1/3"></div>
        
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-start w-full">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">แต้มของคุณ</span>
            </div>
            <button 
              onClick={() => navigate('/user/points-history')}
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
          
          <div className="mt-6 flex flex-col items-center md:items-start md:flex-row md:justify-between md:items-end">
            <div>
              <h2 className="text-5xl font-black flex items-baseline gap-2 tabular-nums drop-shadow-sm tracking-tight">
                {points.toLocaleString()} <span className="text-xl font-bold opacity-80 uppercase">Pts</span>
              </h2>
            </div>
            <p className="text-xs text-indigo-100 mt-4 md:mt-0 opacity-80 backdrop-blur-sm bg-black/10 px-3 py-1.5 rounded-full border border-white/10">
              หมดอายุ 31 ธ.ค. 2026
            </p>
          </div>
        </div>
      </div>

      {/* Reward Catalog */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">ของรางวัลสุดพิเศษ</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {rewards.map(reward => {
            const isLimitReached = reward.userRedeemedCount >= reward.maxPerUser;
            const isOutOfStock = reward.stock === 0;
            const isDisabled = isLimitReached || isOutOfStock || points < reward.pointsCost || redeeming;
            
            return (
            <div key={reward.id} className={`card border-gray-100 flex flex-col h-full bg-white relative overflow-hidden group ${(isOutOfStock || isLimitReached) ? 'opacity-70 grayscale-[0.8]' : ''}`}>
              
              <div className={`${reward.image?.includes('/') ? 'bg-gray-100' : bgMap[reward.image] || bgMap.default} h-28 flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:bg-opacity-80`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm flex items-center justify-center w-full h-full">
                  {reward.image?.includes('/') ? (
                    <img src={getFullUrl(reward.image)} alt={reward.name} className="w-full h-full object-cover" />
                  ) : (
                    iconMap[reward.image] || iconMap.default
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h4 className="font-bold text-[15px] leading-snug text-gray-900">{reward.name}</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                    <span className="font-black text-warning text-sm bg-orange-50 px-2 py-0.5 rounded text-warning/90 border border-orange-100">
                      {reward.pointsCost} Pts
                    </span>
                    {reward.stock > 0 ? (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">เหลือ {reward.stock}</span>
                    ) : (
                      <span className="text-[10px] text-danger font-bold uppercase tracking-wide">หมดสต๊อก</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleRedeem(reward.id, reward.pointsCost, reward.maxPerUser, reward.userRedeemedCount)}
                    disabled={isDisabled}
                    className="w-full py-2 rounded-lg text-sm font-bold transition-all
                               disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none
                               bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md"
                  >
                    {isLimitReached ? 'เต็มสิทธิแล้ว' : isOutOfStock ? 'ครบจำนวนแลกแล้ว' : 'แลกรางวัล'}
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      <section>
        <h3 className="text-lg font-bold mb-3 tracking-tight text-gray-900">ประวัติล่าสุด</h3>
        <div className="flex flex-col gap-3">
          {history.length > 0 ? history.map(entry => (
            <div key={entry.id} className="card p-4 bg-white border border-gray-100 flex justify-between items-center hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${entry.points > 0 ? 'bg-green-50 text-success border-green-100' : 'bg-orange-50 text-warning border-orange-100'}`}>
                  {entry.points > 0 ? <CheckCircle size={20} strokeWidth={2}/> : <Gift size={20} strokeWidth={2}/>}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900 truncate max-w-[160px] leading-tight mb-1">{entry.note}</h4>
                  <p className="text-xs text-gray-500 font-medium">{new Date(entry.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                <p className={`text-base font-black ${entry.points > 0 ? 'text-success' : 'text-danger'}`}>
                  {entry.points > 0 ? `+${entry.points}` : entry.points}
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">{entry.sourceType}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-400 border border-dashed rounded-xl border-gray-200">
              <p className="font-medium">ยังไม่มีประวัติการรับแต้ม</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Rewards;
