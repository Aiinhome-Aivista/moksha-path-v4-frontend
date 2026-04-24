import React from "react";
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react";

interface PracticeItem {
    id: number;
    title: string;
    subject: string;
    chapter: string;
    totalQuestions: number;
    completedQuestions: number;
    difficulty: "Easy" | "Medium" | "Hard";
    estimatedTime: string;
}

const samplePractice: PracticeItem[] = [
    {
        id: 1,
        title: "Algebraic Expressions - Basics",
        subject: "Std. 8 Maths",
        chapter: "Algebra Ch-12",
        totalQuestions: 20,
        completedQuestions: 8,
        difficulty: "Easy",
        estimatedTime: "30 min",
    },
    {
        id: 2,
        title: "Linear Equations in One Variable",
        subject: "Std. 8 Maths",
        chapter: "Algebra Ch-2",
        totalQuestions: 15,
        completedQuestions: 0,
        difficulty: "Medium",
        estimatedTime: "25 min",
    },
    {
        id: 3,
        title: "Factorisation",
        subject: "Std. 8 Maths",
        chapter: "Algebra Ch-14",
        totalQuestions: 25,
        completedQuestions: 25,
        difficulty: "Hard",
        estimatedTime: "40 min",
    },
    {
        id: 4,
        title: "Understanding Quadrilaterals",
        subject: "Std. 8 Maths",
        chapter: "Geometry Ch-3",
        totalQuestions: 18,
        completedQuestions: 5,
        difficulty: "Medium",
        estimatedTime: "35 min",
    },
];

const difficultyColor = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700",
};

const Practice: React.FC = () => {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-[#A3C627]" />
                <h2 className="text-lg font-semibold text-gray-800">Practice Sets</h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {samplePractice.length} sets
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePractice.map((item) => {
                    const progress = Math.round(
                        (item.completedQuestions / item.totalQuestions) * 100
                    );
                    const isComplete = progress === 100;

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyColor[item.difficulty]}`}
                                >
                                    {item.difficulty}
                                </span>
                                {isComplete && (
                                    <CheckCircle
                                        size={16}
                                        className="text-green-500"
                                    />
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-sm text-gray-800 mb-1">
                                {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                                {item.subject} · {item.chapter}
                            </p>

                            {/* Progress */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>
                                        {item.completedQuestions}/{item.totalQuestions} questions
                                    </span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#A3C627] rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} />
                                    <span>{item.estimatedTime}</span>
                                </div>
                                <button className="flex items-center gap-1 text-xs font-medium text-[#A3C627] group-hover:text-[#8fb31e] transition-colors">
                                    <Play size={12} />
                                    {isComplete ? "Retry" : progress > 0 ? "Continue" : "Start"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Practice;
