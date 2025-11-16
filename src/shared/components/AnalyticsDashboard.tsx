import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Target, Award, AlertCircle, Brain, Clock, BarChart3, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { studyDB, StudySession, QuizResult } from '@/src/lib/studyDB';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

const COLORS = ['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await studyDB.init();
      const [sessionsData, quizData] = await Promise.all([
        studyDB.getSessions(),
        studyDB.getQuizResults(),
      ]);
      setSessions(sessionsData);
      setQuizResults(quizData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time per subject
  const timePerSubject = useMemo(() => {
    const subjectTime: Record<string, number> = {};
    sessions.forEach((session) => {
      subjectTime[session.subject] = (subjectTime[session.subject] || 0) + session.duration;
    });
    return Object.entries(subjectTime)
      .map(([subject, minutes]) => ({
        subject,
        hours: Math.round((minutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [sessions]);

  // Calculate quiz performance trends
  const performanceTrends = useMemo(() => {
    const last7Days = quizResults
      .slice(-7)
      .map((result) => ({
        date: new Date(result.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: result.score,
      }));
    return last7Days;
  }, [quizResults]);

  // Identify weak topics
  const weakTopics = useMemo(() => {
    const topicScores: Record<string, { total: number; count: number; weakQuestions: string[] }> = {};
    
    quizResults.forEach((result) => {
      if (!topicScores[result.topic]) {
        topicScores[result.topic] = { total: 0, count: 0, weakQuestions: [] };
      }
      topicScores[result.topic].total += result.score;
      topicScores[result.topic].count += 1;
      topicScores[result.topic].weakQuestions.push(...result.weakQuestions);
    });

    return Object.entries(topicScores)
      .map(([topic, data]) => ({
        topic,
        avgScore: Math.round(data.total / data.count),
        attempts: data.count,
        weakQuestions: data.weakQuestions.length,
      }))
      .filter((t) => t.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  }, [quizResults]);

  // Generate personalized recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = [];

    // Check study consistency
    const recentSessions = sessions.filter(
      (s) => Date.now() - s.startTime < 7 * 24 * 60 * 60 * 1000
    );
    if (recentSessions.length < 3) {
      recs.push('Try to study at least 3 times per week for better retention');
    }

    // Check weak topics
    if (weakTopics.length > 0) {
      recs.push(`Focus on improving ${weakTopics[0].topic} (${weakTopics[0].avgScore}% avg score)`);
    }

    // Check quiz performance
    const avgQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
      : 0;
    if (avgQuizScore > 0 && avgQuizScore < 70) {
      recs.push('Consider reviewing flashcards more frequently to improve quiz scores');
    } else if (avgQuizScore >= 85) {
      recs.push('Great job! Try advancing to more challenging topics');
    }

    // Check study time distribution
    if (timePerSubject.length > 0) {
      const topSubject = timePerSubject[0];
      const totalTime = timePerSubject.reduce((sum, s) => sum + s.hours, 0);
      if (topSubject.hours / totalTime > 0.7) {
        recs.push(`Balance your study time - ${topSubject.subject} is ${Math.round((topSubject.hours / totalTime) * 100)}% of total`);
      }
    }

    if (recs.length === 0) {
      recs.push('Keep up the excellent work! Your study habits are well-balanced');
    }

    return recs;
  }, [sessions, weakTopics, quizResults, timePerSubject]);

  // Overall stats
  const stats = useMemo(() => {
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalQuizzes = quizResults.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes)
      : 0;
    const studyStreak = calculateStreak(sessions);

    return { totalTime, totalQuizzes, avgScore, studyStreak };
  }, [sessions, quizResults]);

  const calculateStreak = (sessions: StudySession[]): number => {
    if (sessions.length === 0) return 0;

    const uniqueDays = [
      ...new Set(
        sessions.map((s) =>
          new Date(s.startTime).toISOString().split('T')[0]
        )
      ),
    ].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const current = new Date(uniqueDays[i]).getTime();
      const next = new Date(uniqueDays[i + 1]).getTime();
      const diff = (current - next) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black/90">
        <div className="text-cyan-400 text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/90 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-cyan-500/30 bg-black/50">
        <button
          onClick={onBack}
          className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-cyan-400" />
        </button>
        <BarChart3 size={24} className="text-cyan-400" />
        <h1 className="text-xl font-semibold text-cyan-400">Study Analytics</h1>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
            <Clock className="text-cyan-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-cyan-300">{Math.round(stats.totalTime / 60)}h</div>
            <div className="text-xs text-gray-400">Total Study Time</div>
          </div>
          <div className="bg-black/40 border border-magenta-500/30 rounded-lg p-4">
            <Target className="text-magenta-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-magenta-300">{stats.avgScore}%</div>
            <div className="text-xs text-gray-400">Avg Quiz Score</div>
          </div>
          <div className="bg-black/40 border border-amber-500/30 rounded-lg p-4">
            <Award className="text-amber-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-amber-300">{stats.studyStreak}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
            <Brain className="text-green-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-green-300">{stats.totalQuizzes}</div>
            <div className="text-xs text-gray-400">Quizzes Taken</div>
          </div>
        </div>

        {/* Performance Trends */}
        {performanceTrends.length > 0 && (
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> Performance Trends (Last 7 Quizzes)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4' }} />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Time per Subject */}
        {timePerSubject.length > 0 && (
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} /> Time Per Subject
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timePerSubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="subject" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4' }} />
                <Bar dataKey="hours" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <AlertCircle size={18} /> Topics Needing Attention
            </h3>
            <div className="space-y-2">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-black/40 rounded border border-red-500/20">
                  <span className="text-gray-200">{topic.topic}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-red-400">{topic.avgScore}% avg</span>
                    <span className="text-gray-500">{topic.attempts} attempts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
            <Brain size={18} /> Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
