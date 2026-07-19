import { useQuery } from '@tanstack/react-query'
import { homeQuery } from '@/api/home/queries'

export const useGetHome = () => useQuery(homeQuery.detail())
