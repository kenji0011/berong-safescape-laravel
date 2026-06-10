import React from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { AdaptiveQuiz } from '@/Components/AdaptiveQuiz'

const QuizPage = () => {
  return <AdaptiveQuiz moduleNum={5} isFinalExam={true} />
}

QuizPage.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>

export default QuizPage
