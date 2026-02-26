import { TeamMember, Stat, FAQ } from "@/types";

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Amara Okonkwo",
    role: "Founder & CEO",
    bio: "With over 15 years in cybersecurity and a PhD from the University of Cape Town, Dr. Okonkwo founded Cyber Defend Africa Academy with a vision to bridge the cybersecurity skills gap across the continent.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: "2",
    name: "Kwame Mensah",
    role: "Head of Training",
    bio: "Kwame leads our curriculum development and instructor training. His passion for practical, hands-on learning has shaped our unique approach to cybersecurity education.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: "3",
    name: "Fatima El-Amin",
    role: "Director of Partnerships",
    bio: "Fatima builds relationships with organizations across Africa, ensuring our training programs meet real industry needs and create pathways for graduates.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    linkedin: "#",
  },
  {
    id: "4",
    name: "Samuel Adebayo",
    role: "Technical Director",
    bio: "Samuel ensures our technical infrastructure and lab environments provide students with cutting-edge, realistic learning experiences.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#",
  },
];

export const stats: Stat[] = [
  { value: "5,000+", label: "Students Trained", icon: "Users" },
  { value: "50+", label: "Expert-Led Courses", icon: "BookOpen" },
  { value: "15+", label: "African Countries", icon: "Globe" },
  { value: "95%", label: "Success Rate", icon: "TrendingUp" },
];

export const faqs: FAQ[] = [
  {
    question: "Who are the courses designed for?",
    answer: "Our courses are designed for anyone interested in cybersecurity, from complete beginners to experienced IT professionals looking to specialize. We have programs for individuals seeking career advancement and organizations wanting to train their teams.",
  },
  {
    question: "Do I need prior technical experience?",
    answer: "It depends on the course. Our fundamentals and awareness courses require no prior experience. Intermediate and advanced courses have prerequisites listed on their pages. We recommend starting with our Cybersecurity Fundamentals course if you're new to the field.",
  },
  {
    question: "Are the certifications recognized internationally?",
    answer: "Yes! Our courses prepare you for globally recognized certifications like CompTIA Security+, CEH, CISSP, and cloud security certifications from AWS, Azure, and GCP. These are respected by employers worldwide.",
  },
  {
    question: "How long do I have access to course materials?",
    answer: "Once enrolled, you have lifetime access to course materials, including any future updates. You can learn at your own pace and revisit content whenever you need a refresher.",
  },
  {
    question: "Do you offer corporate training packages?",
    answer: "Absolutely! We provide customized training solutions for organizations of all sizes. Contact us to discuss your specific requirements and we'll create a tailored program for your team.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards, PayPal, and mobile money payments including M-Pesa, MTN Mobile Money, and Airtel Money. We also offer payment plans for select courses.",
  },
  {
    question: "Is there job placement assistance?",
    answer: "Yes, we provide career support including resume reviews, interview preparation, and connections to our network of hiring partners across Africa. Many of our graduates have secured positions at leading organizations.",
  },
  {
    question: "Can I get a refund if the course isn't right for me?",
    answer: "We offer a 14-day money-back guarantee. If you're not satisfied with the course within the first 14 days, contact us for a full refund—no questions asked.",
  },
];