"use client"

import React, { useEffect, useState } from 'react'
import styles from './brochure.module.css'
import BrochureTemplate from '@/components/brochure/brochureTemplate'
import { supabase } from '@/lib/supabase'
import Loader from '@/custom/loader/loader'

interface EnquiryData {
  enquiry_number: string
  parent_name: string
  child_name: string
  phone: string
  program: string
  created_at: string
}

const TESTIMONIALS = [
  { name: 'Parent A', text: 'Warm staff and great learning environment.', avatar: '/assets/testimonial/1.jpg' },
  { name: 'Parent B', text: 'My child loves the activities and teachers.', avatar: '/assets/testimonial/2.png' },
  { name: 'Parent C', text: 'Excellent communication and care.', avatar: '/assets/testimonial/3.png' },
]

const PROGRAMS = [
  { 
    title: 'Toddlers', 
    desc: 'Ages 2–3: sensory play & bonding', 
    img: '/assets/programs/toddler.jpg',
    icon: '👶',
    focus: ['Sensory exploration', 'Language development', 'Social bonding'],
    activities: 'Play, singing, messy play, outdoor time',
  },
  { 
    title: 'Nursery', 
    desc: 'Ages 3–4: foundation learning & routines', 
    img: '/assets/programs/nursery.jpg',
    icon: '🧒',
    focus: ['Letter & number recognition', 'Fine motor skills', 'Friendship building'],
    activities: 'Art, crafts, storytelling, music & movement',
  },
  { 
    title: 'Pre-K', 
    desc: 'Ages 4–5: literacy & pre-academics', 
    img: '/assets/programs/prekg.jpg',
    icon: 'BOOKS',
    focus: ['Pre-reading & writing', 'Math basics', 'Critical thinking'],
    activities: 'Phonics, projects, STEM exploration, drama',
  },
  { 
    title: 'Kindergarten', 
    desc: 'Ages 5–6: readiness & skills', 
    img: '/assets/programs/kg.jpg',
    icon: '🎓',
    focus: ['School readiness', 'Independence', 'Academic foundations'],
    activities: 'Reading, writing, problem-solving, collaboration',
  },
]

const EVENTS = [
  { title: 'Independence Day', img: '/assets/gallery/independenceday.png' },
  { title: 'Teacher\'s Day', img: '/assets/gallery/teacherday.png' },
  { title: 'Holi Celebration', img: '/assets/gallery/holi.png' },
  { title: 'Diwali Festival', img: '/assets/gallery/diwali.png' },
]

const HIGHLIGHTS = [
  { icon: '🏫', title: 'Safe & Secure', text: 'CCTV monitored, trained staff 24/7' },
  { icon: '👨‍🏫', title: 'Expert Teachers', text: 'Certified with 5+ years experience' },
  { icon: 'ARTS', title: 'Creative Arts', text: 'Art, music, dance & storytelling' },
  { icon: 'BOOKS', title: 'Literacy', text: 'Daily phonics & reading time' },
]

const SCHOOL_STATS = [
  { label: 'Years of Excellence', value: '15+' },
  { label: 'Happy Families', value: '500+' },
  { label: 'Dedicated Staff', value: '50+' },
  { label: 'Alumni Success Rate', value: '98%' },
]

const SCHOOL_VALUES = [
  { icon: '💚', value: 'Compassion', desc: 'Nurturing warm relationships' },
  { icon: 'EXCELLENCE', value: 'Excellence', desc: 'Highest standards in education' },
  { icon: '🤝', value: 'Community', desc: 'Building strong families' },
  { icon: 'TARGETS', value: 'Growth', desc: 'Fostering all-round development' },
]

const FOUNDER_MESSAGE = {
  name: 'Ms. Priya Sharma',
  title: 'Founder & Director',
  image: '/assets/about/director.jpg',
  message: 'With over 15 years of experience in early childhood education, I founded Ank Square with a simple belief: every child deserves a space where they can be their authentic selves, explore freely, and grow holistically. Our team is dedicated to creating that nurturing environment where learning becomes a joyful journey.',
}

export default function BrochurePage({
  searchParams,
}: {
  searchParams: Promise<{ enquiry_number?: string }>
}) {
  const [params, setParams] = React.useState<{ enquiry_number?: string }>({})
  const [enquiryData, setEnquiryData] = useState<EnquiryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unwrapParams = async () => {
      const resolved = await searchParams
      setParams(resolved)
    }
    unwrapParams()
  }, [searchParams])

  useEffect(() => {
    const fetchEnquiryData = async () => {
      if (!params.enquiry_number) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('enquiry_number, parent_name, child_name, phone, program, created_at')
          .eq('enquiry_number', params.enquiry_number)
          .single()

        if (error) {
          console.error('Error fetching enquiry:', error)
          setLoading(false)
          return
        }

        if (data) {
          setEnquiryData(data as EnquiryData)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnquiryData()
  }, [params.enquiry_number])

  if (loading) {
    return <Loader isVisible={true} message="Loading Brochure..." fullScreen={true} />
  }

  return (
    <main>
      <BrochureTemplate enquiryData={enquiryData || undefined} />
    </main>
  )
}
