  const addTicket = async () => {
    const newTickets = tickets + 1;
    const currentWeek = getCurrentWeek();
    setTickets(newTickets);
    setLastRewardWeek(currentWeek);
    setShowReward(true);
    await saveData(streak, checkedDays, totalDays, newTickets, usedTickets, currentWeek);
  };

  const useTicket = async (dayIndex) => {
    // Check if already used a ticket this week
    if (usedTickets.length >= 1) {
      alert('⚠️ Você já usou um ticket esta semana! Apenas 1 ticket por semana pode ser usado. 🐻');
      return;
    }
    
    if (tickets > 0 && !usedTickets.includes(dayIndex) && !checkedDays.includes(dayIndex)) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setTicketQuote(randomQuote);
      setShowTicketMessage(true);
      
      const newTickets = tickets - 1;
      const newUsedTickets = [...usedTickets, dayIndex];
      setTickets(newTickets);
      setUsedTickets(newUsedTickets);
      await saveData(streak, checkedDays, totalDays, newTickets, newUsedTickets);
      
      setTimeout(() => {
        setShowTicketMessage(false);
      }, 4000);
    }
  };

  const redeemGift = async () => {
    if (tickets >= 5) {
      const newTickets = tickets - 5;
      const newGifts = pendingGifts + 1;
      setTickets(newTickets);
      setPendingGifts(newGifts);
      await saveData(streak, checkedDays, totalDays, newTickets, usedTickets, lastRewardWeek, newGifts);
      setShowGiftOption(false);
    }
  };

  const markGiftReceived = async () => {
    if (pendingGifts > 0) {
      const newGifts = pendingGifts - 1;
      setPendingGifts(newGifts);
      await saveData(streak, checkedDays, totalDays, tickets, usedTickets, lastRewardWeek, newGifts);
    }
  };import React, { useState, useEffect } from 'react';
import { Heart, Trophy, Calendar, Sparkles, Settings, X, Gift } from 'lucide-react';

const SobrietyTracker = () => {
  const [streak, setStreak] = useState(0);
  const [checkedDays, setCheckedDays] = useState([]);
  const [showReward, setShowReward] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [usedTickets, setUsedTickets] = useState([]);
  const [lastRewardWeek, setLastRewardWeek] = useState(null);
  const [showTicketMessage, setShowTicketMessage] = useState(false);
  const [ticketQuote, setTicketQuote] = useState('');
  const [showGiftOption, setShowGiftOption] = useState(false);
  const [pendingGifts, setPendingGifts] = useState(0);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Check if we should add a new ticket (weekly check - when 6 days completed)
  useEffect(() => {
    if (!loading && streak === 6 && lastRewardWeek !== getCurrentWeek()) {
      addTicket();
    }
  }, [streak, loading]);

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const motivationalQuotes = [
    "Você é mais forte do que pensa! 💪🐻",
    "Cada escolha saudável é uma vitória! 🌟",
    "Orgulhoso de você por cuidar de si mesma! 💜",
    "Seu bem-estar importa muito! 🌸",
    "Aproveite com moderação e amor próprio! 🎉",
    "Você merece esse momento especial! ✨",
    "Equilíbrio é a chave da felicidade! 🌈",
    "Celebre a vida com consciência! 🥂"
  ];

  const loadData = async () => {
    try {
      const [streakData, daysData, totalData, ticketsData, usedTicketsData, lastRewardData, giftsData] = await Promise.all([
        window.storage.get('sobriety-streak', true).catch(() => null),
        window.storage.get('sobriety-days', true).catch(() => null),
        window.storage.get('sobriety-total', true).catch(() => null),
        window.storage.get('sobriety-tickets', true).catch(() => null),
        window.storage.get('sobriety-used-tickets', true).catch(() => null),
        window.storage.get('sobriety-last-reward', true).catch(() => null),
        window.storage.get('sobriety-pending-gifts', true).catch(() => null)
      ]);
      
      setStreak(streakData?.value ? parseInt(streakData.value) : 0);
      setCheckedDays(daysData?.value ? JSON.parse(daysData.value) : []);
      setTotalDays(totalData?.value ? parseInt(totalData.value) : 0);
      setTickets(ticketsData?.value ? parseInt(ticketsData.value) : 1);
      setUsedTickets(usedTicketsData?.value ? JSON.parse(usedTicketsData.value) : []);
      setLastRewardWeek(lastRewardData?.value ? parseInt(lastRewardData.value) : null);
      setPendingGifts(giftsData?.value ? parseInt(giftsData.value) : 0);
    } catch (error) {
      console.log('Starting fresh:', error);
      setStreak(0);
      setCheckedDays([]);
      setTotalDays(0);
      setTickets(1);
      setUsedTickets([]);
      setLastRewardWeek(null);
      setPendingGifts(0);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newStreak, newDays, newTotal, newTickets = tickets, newUsedTickets = usedTickets, newLastReward = lastRewardWeek, newGifts = pendingGifts) => {
    try {
      await window.storage.set('sobriety-streak', newStreak.toString(), true);
      await window.storage.set('sobriety-days', JSON.stringify(newDays), true);
      await window.storage.set('sobriety-total', newTotal.toString(), true);
      await window.storage.set('sobriety-tickets', newTickets.toString(), true);
      await window.storage.set('sobriety-used-tickets', JSON.stringify(newUsedTickets), true);
      await window.storage.set('sobriety-pending-gifts', newGifts.toString(), true);
      if (newLastReward !== null) {
        await window.storage.set('sobriety-last-reward', newLastReward.toString(), true);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const toggleDay = async (dayIndex) => {
    const newCheckedDays = [...checkedDays];
    const isChecked = newCheckedDays.includes(dayIndex);
    
    if (isChecked) {
      newCheckedDays.splice(newCheckedDays.indexOf(dayIndex), 1);
    } else {
      newCheckedDays.push(dayIndex);
    }
    
    newCheckedDays.sort((a, b) => a - b);
    
    // Calculate streak based on total checked days (skipped days don't break streak)
    const newStreak = newCheckedDays.length;
    
    const newTotal = isChecked ? totalDays - 1 : totalDays + 1;
    
    setCheckedDays(newCheckedDays);
    setStreak(newStreak);
    setTotalDays(newTotal);
    
    await saveData(newStreak, newCheckedDays, newTotal);
    
    // Show reward if 6 days completed
    if (newStreak === 6) {
      setShowReward(true);
    }
  };

  const resetWeek = async () => {
    setCheckedDays([]);
    setStreak(0);
    setShowReward(false);
    setUsedTickets([]);
    await saveData(0, [], totalDays, tickets, [], lastRewardWeek, pendingGifts);
    setShowSettings(false);
  };

  const resetTotal = async () => {
    setTotalDays(0);
    await saveData(streak, checkedDays, 0, tickets, usedTickets, lastRewardWeek, pendingGifts);
    setShowSettings(false);
  };

  const resetAll = async () => {
    setCheckedDays([]);
    setStreak(0);
    setTotalDays(0);
    setShowReward(false);
    setTickets(1);
    setUsedTickets([]);
    setLastRewardWeek(null);
    setPendingGifts(0);
    await saveData(0, [], 0, 1, [], null, 0);
    setShowSettings(false);
  };

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Carregando...</div>
      </div>
    );
  }

  if (showReward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="text-8xl animate-bounce">🐻</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎉 Parabéns! 🎉
          </h1>
          <p className="text-2xl text-purple-600 font-semibold mb-6">
            6 Dias Sem Álcool!
          </p>
          <p className="text-gray-600 mb-4 text-lg">
            Você completou o desafio! Estamos muito orgulhosos de você. Esta é uma grande conquista! 💜
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="text-6xl mb-3">🎟️</div>
            <p className="text-yellow-800 font-bold text-lg mb-2">
              +1 Ticket Ganho!
            </p>
            <p className="text-yellow-700 text-sm">
              Use para aproveitar 2-3 copos com moderação em qualquer dia da semana
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-purple-700 font-medium">
              🐻 Ursinho está orgulhoso de você!
            </p>
          </div>
          <button
            onClick={resetWeek}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            Começar Nova Semana
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center flex-1 justify-center">
              <Heart className="w-8 h-8 text-pink-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Renascer</h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-8 py-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Cute bear character */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-4xl animate-bounce">
                  🐻
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Background heart outline */}
                  <path
                    d="M50,90 C50,90 10,65 10,40 C10,25 20,15 32.5,15 C40,15 45,20 50,27.5 C55,20 60,15 67.5,15 C80,15 90,25 90,40 C90,65 50,90 50,90 Z"
                    fill="#f3e8ff"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                  {/* Filled heart that grows */}
                  <defs>
                    <clipPath id="heartClip">
                      <rect
                        x="0"
                        y={100 - (streak / 6) * 100}
                        width="100"
                        height={(streak / 6) * 100}
                      />
                    </clipPath>
                  </defs>
                  <path
                    d="M50,90 C50,90 10,65 10,40 C10,25 20,15 32.5,15 C40,15 45,20 50,27.5 C55,20 60,15 67.5,15 C80,15 90,25 90,40 C90,65 50,90 50,90 Z"
                    fill="url(#heartGradient)"
                    clipPath="url(#heartClip)"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {streak}/6
              </div>
              <div className="text-gray-600 font-medium">Dias Esta Semana</div>
            </div>
          </div>

          {/* Tickets Display */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl">🎟️</div>
              <div>
                <div className="text-sm text-yellow-700 font-medium">Tickets Disponíveis</div>
                <div className="text-3xl font-bold text-yellow-600">{tickets}</div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-3 text-center">
              Ganhe 1 ticket a cada 6 dias sem álcool! 🐻<br/>
              Use 1 ticket por semana para aproveitar 2-3 copos
            </p>
            {usedTickets.length > 0 && (
              <div className="mt-3 bg-yellow-100 rounded-lg p-2 text-center">
                <p className="text-xs text-yellow-800">
                  ✓ Ticket usado esta semana ({usedTickets.length}/1)
                </p>
              </div>
            )}
            {tickets >= 5 && (
              <button
                onClick={() => setShowGiftOption(true)}
                className="mt-4 w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-xl font-semibold hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg flex items-center justify-center gap-2 animate-pulse"
              >
                <Gift className="w-5 h-5" />
                Trocar 5 Tickets por Presente! 🎁
              </button>
            )}
          </div>

          {/* Pending Gifts Display */}
          {pendingGifts > 0 && (
            <div className="bg-pink-50 border-2 border-pink-300 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-bounce">🎁</div>
                  <div>
                    <div className="text-sm text-pink-700 font-medium">Presentes Pendentes</div>
                    <div className="text-3xl font-bold text-pink-600">{pendingGifts}</div>
                  </div>
                </div>
                <button
                  onClick={markGiftReceived}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  Presente Recebido! ✓
                </button>
              </div>
              <p className="text-xs text-pink-700 mt-3 text-center">
                Pergunte ao seu amor qual é a surpresa! 💝🐻
              </p>
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Esta Semana
              </h2>
            </div>
            
            <div className="grid grid-cols-7 gap-3">
              {days.map((day, index) => {
                const isChecked = checkedDays.includes(index);
                const isTicketUsed = usedTickets.includes(index);
                return (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">{day}</div>
                    <button
                      onClick={() => toggleDay(index)}
                      className={`w-full aspect-square rounded-xl transition-all duration-500 flex items-center justify-center text-2xl transform hover:scale-110 ${
                        isChecked
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105 animate-bounce'
                          : isTicketUsed
                          ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isChecked ? '✓' : isTicketUsed ? '🎟️' : '○'}
                    </button>
                    {!isChecked && !isTicketUsed && (
                      <button
                        onClick={() => useTicket(index)}
                        disabled={tickets === 0}
                        className={`mt-2 text-xs px-2 py-1 rounded-lg transition-all ${
                          tickets > 0
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Usar 🎟️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 text-purple-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Total de Dias Sem Álcool</div>
                  <div className="text-2xl font-bold text-purple-600">{totalDays}</div>
                </div>
              </div>
              {streak < 6 && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Dias Até a Recompensa</div>
                  <div className="text-2xl font-bold text-pink-500">{6 - streak}</div>
                </div>
              )}
            </div>
          </div>

          {streak > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center animate-pulse">
              <p className="text-green-700 font-medium">
                {streak === 1 && "Ótimo começo! Continue assim! 💪"}
                {streak === 2 && "Dois dias forte! Você consegue! 🌟"}
                {streak === 3 && "Metade do caminho! Progresso incrível! 🎯"}
                {streak === 4 && "Quatro dias! Você está indo maravilhosamente! ✨"}
                {streak === 5 && "Cinco dias! Quase lá! 🚀"}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="w-full mt-6 bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Configurações
          </button>
        </div>

        <div className="text-center text-gray-500 text-sm">
          Este rastreador é compartilhado entre vocês dois 💜
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Opções de Reiniciar</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Escolha o que deseja reiniciar
                </p>

                <div className="space-y-3">
                  <button
                    onClick={resetWeek}
                    className="w-full bg-white border-2 border-purple-200 text-gray-700 py-3 rounded-xl hover:bg-purple-50 transition-colors font-medium"
                  >
                    Reiniciar Apenas Esta Semana
                  </button>

                  <button
                    onClick={resetTotal}
                    className="w-full bg-white border-2 border-orange-200 text-gray-700 py-3 rounded-xl hover:bg-orange-50 transition-colors font-medium"
                  >
                    Reiniciar Total de Dias
                  </button>

                  <button
                    onClick={resetAll}
                    className="w-full bg-white border-2 border-red-200 text-gray-700 py-3 rounded-xl hover:bg-red-50 transition-colors font-medium"
                  >
                    Reiniciar Tudo
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Use Message */}
      {showTicketMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce">
            <div className="text-7xl mb-4">🐻💝</div>
            <h2 className="text-2xl font-bold text-purple-600 mb-4">
              Ticket Usado!
            </h2>
            <p className="text-lg text-gray-700 font-medium mb-4">
              {ticketQuote}
            </p>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-yellow-700 text-sm">
                Aproveite seus 2-3 copos com moderação e amor próprio! 🥂
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gift Redemption Modal */}
      {showGiftOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-8xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-3xl font-bold text-purple-600 mb-4">
              Presente Especial!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Você tem {tickets} tickets! Quer trocar 5 tickets por um presente surpresa? 🐻💜
            </p>
            <div className="bg-pink-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-pink-700">
                O presente ficará pendente até você recebê-lo! Depois marque como "Presente Recebido" 🎁
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={redeemGift}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Sim! Quero Meu Presente! 🎁
              </button>
              <button
                onClick={() => setShowGiftOption(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Guardar Para Depois
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SobrietyTracker;