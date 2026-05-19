import React, { useState } from 'react'
import { MessageSquare, Star, X, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'

export const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return

        setIsSubmitting(true)
        setErrorMsg('')
        try {
            await axios.post('/api/feedback', {
                featureName: 'General Platform',
                featureType: 'general', // Needs to match Laravel validation ('general')
                rating,
                comments
            })
            setIsSuccess(true)
            setTimeout(() => {
                setIsOpen(false)
                setIsSuccess(false)
                setRating(0)
                setComments('')
            }, 3000)
        } catch (err: any) {
            console.error('Failed to submit feedback', err)
            setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-6 sm:left-8 z-50 ss-feedback-widget">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-2 border-yellow-500 shadow-[0_4px_0_0_#ca8a04] dark:shadow-[0_4px_0_0_#854d0e] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all rounded-full px-4 py-3 font-black text-sm flex items-center gap-2"
                >
                    <MessageSquare className="h-5 w-5" />
                    <span className="hidden sm:inline">Send Feedback</span>
                </button>
            )}

            {/* Modal Box */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-slate-200 dark:border-slate-800 shadow-2xl w-80 sm:w-96 overflow-hidden animate-in slide-in-from-bottom-8 fade-in flex flex-col transition-colors duration-500">
                    <div className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-white font-black">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            How are we doing?
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full p-1 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-6">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in fade-in">
                                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 border-4 border-green-200 dark:border-green-800">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="font-black text-xl text-slate-800 dark:text-white transition-colors">Thank You!</h3>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 transition-colors">Your feedback makes SafeScape better.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                        >
                                            <Star 
                                                className={cn(
                                                    "h-8 w-8 sm:h-10 sm:w-10 transition-colors",
                                                    (hoverRating || rating) >= star 
                                                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" 
                                                        : "text-slate-200 dark:text-slate-800"
                                                )} 
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">
                                        Tell us more (Optional)
                                    </label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="What did you like? What can we improve?"
                                        className="w-full resize-none bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-0 transition-colors h-24"
                                    />
                                    {errorMsg && <p className="text-red-500 text-xs font-bold mt-2">{errorMsg}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={rating === 0 || isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 border-b-[4px] border-blue-700 active:border-b-0 active:translate-y-[4px] text-white rounded-xl py-3 font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
