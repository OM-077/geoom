import { redirect } from 'next/navigation'

export default function EnginePage() {
  redirect('/signals?tab=platforms')
}
