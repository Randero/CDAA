import { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Top 10 Cybersecurity Threats Facing African Businesses in 2024",
    slug: "top-cybersecurity-threats-africa-2024",
    excerpt: "As Africa's digital economy grows, so do the cyber threats. Learn about the most pressing security challenges facing organizations across the continent and how to protect your business.",
    content: `
# Top 10 Cybersecurity Threats Facing African Businesses in 2024

Africa's digital transformation is accelerating at an unprecedented pace. With this growth comes increased exposure to cyber threats that organizations must understand and address.

## 1. Ransomware Attacks

Ransomware continues to be the most devastating threat, with African organizations increasingly targeted due to perceived weaker defenses.

## 2. Business Email Compromise (BEC)

Sophisticated email fraud schemes are causing significant financial losses across the continent, particularly in the financial and manufacturing sectors.

## 3. Mobile Banking Fraud

With Africa leading in mobile money adoption, attackers are developing increasingly sophisticated methods to exploit these platforms.

## 4. Supply Chain Attacks

As African businesses integrate into global supply chains, they become potential entry points for attackers targeting larger organizations.

## 5. Cloud Security Misconfiguration

Rapid cloud adoption without proper security measures is leaving sensitive data exposed.

## Protecting Your Organization

The key to defense is a combination of technology, training, and proper governance. Invest in your people, implement robust security controls, and stay informed about emerging threats.
    `,
    category: "threat-intelligence",
    author: {
      name: "Dr. Amara Okonkwo",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      role: "Chief Security Architect",
    },
    publishedAt: "2024-12-15",
    readTime: "8 min read",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
    featured: true,
  },
  {
    id: "2",
    title: "How to Start Your Cybersecurity Career in Africa",
    slug: "start-cybersecurity-career-africa",
    excerpt: "A comprehensive guide for aspiring cybersecurity professionals in Africa. Learn the skills, certifications, and pathways to launch your career in this high-demand field.",
    content: `
# How to Start Your Cybersecurity Career in Africa

The demand for cybersecurity professionals in Africa far exceeds supply, creating incredible opportunities for those willing to invest in developing their skills.

## Why Cybersecurity?

- Growing demand across all industries
- Competitive salaries
- Remote work opportunities
- Meaningful work protecting organizations

## Getting Started

1. **Build Your Foundation**: Start with IT fundamentals
2. **Learn Security Basics**: Understanding threats and defenses
3. **Get Hands-On**: Practice in lab environments
4. **Earn Certifications**: CompTIA Security+, CEH, CISSP
5. **Build Your Network**: Join local security communities

## Recommended Learning Path

Start with our Cybersecurity Fundamentals course, then specialize in an area that interests you, whether it's ethical hacking, cloud security, or incident response.
    `,
    category: "career-advice",
    author: {
      name: "Kwame Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      role: "Senior Penetration Tester",
    },
    publishedAt: "2024-12-10",
    readTime: "6 min read",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
  },
  {
    id: "3",
    title: "Setting Up Your First Penetration Testing Lab",
    slug: "penetration-testing-lab-setup",
    excerpt: "Step-by-step guide to building a safe, legal environment for practicing ethical hacking skills. Perfect for beginners looking to develop hands-on experience.",
    content: `
# Setting Up Your First Penetration Testing Lab

A personal lab environment is essential for developing practical cybersecurity skills safely and legally.

## What You'll Need

- A computer with at least 16GB RAM
- Virtualization software (VirtualBox or VMware)
- Kali Linux
- Vulnerable VMs (Metasploitable, DVWA)

## Step-by-Step Setup

1. Install virtualization software
2. Download and configure Kali Linux
3. Set up vulnerable target machines
4. Create an isolated network
5. Start practicing!

## Safety First

Always ensure your lab is isolated from production networks. Never practice on systems you don't own or have explicit permission to test.
    `,
    category: "tutorials",
    author: {
      name: "Kwame Mensah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      role: "Senior Penetration Tester",
    },
    publishedAt: "2024-12-05",
    readTime: "10 min read",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop",
  },
  {
    id: "4",
    title: "African Union Adopts New Cybersecurity Framework",
    slug: "african-union-cybersecurity-framework",
    excerpt: "The AU's new cybersecurity framework aims to harmonize cyber laws across the continent. Here's what it means for organizations operating in Africa.",
    content: `
# African Union Adopts New Cybersecurity Framework

The African Union has taken a significant step toward continental cybersecurity cooperation with the adoption of a comprehensive framework.

## Key Highlights

- Standardized incident reporting requirements
- Cross-border cooperation mechanisms
- Capacity building initiatives
- Data protection guidelines

## Impact on Organizations

Organizations operating across African borders will need to adapt their security programs to meet these new standards.

## Next Steps

Countries are expected to begin implementing the framework over the next 24 months. Now is the time to start preparing.
    `,
    category: "industry-news",
    author: {
      name: "Dr. Amara Okonkwo",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      role: "Chief Security Architect",
    },
    publishedAt: "2024-11-28",
    readTime: "5 min read",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
  },
  {
    id: "5",
    title: "5 Essential Security Tools Every SOC Analyst Should Master",
    slug: "essential-soc-analyst-tools",
    excerpt: "From SIEM platforms to threat intelligence tools, discover the must-know technologies for anyone working in a Security Operations Center.",
    content: `
# 5 Essential Security Tools Every SOC Analyst Should Master

Effective SOC analysts need to be proficient with a variety of security tools. Here are the five most essential ones.

## 1. SIEM Platforms

Splunk, QRadar, or Azure Sentinel - understanding at least one SIEM is crucial.

## 2. Wireshark

Network traffic analysis is fundamental to threat detection.

## 3. TheHive/MISP

Incident response and threat intelligence platforms.

## 4. YARA

Pattern matching for malware identification.

## 5. Volatility

Memory forensics for advanced threat detection.

## Getting Hands-On

Our SOC Analyst course provides practical experience with all these tools in realistic scenarios.
    `,
    category: "tools",
    author: {
      name: "Samuel Adebayo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      role: "SOC Manager",
    },
    publishedAt: "2024-11-20",
    readTime: "7 min read",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
  },
  {
    id: "6",
    title: "Building a Security-First Culture in Your Organization",
    slug: "building-security-culture",
    excerpt: "Technology alone can't protect your organization. Learn how to create a culture where security is everyone's responsibility.",
    content: `
# Building a Security-First Culture in Your Organization

The most sophisticated security tools are useless if your people aren't security-conscious.

## Why Culture Matters

- 95% of breaches involve human error
- Employees are the first line of defense
- Culture changes behavior

## Building Blocks

1. **Leadership Commitment**: Security starts at the top
2. **Continuous Training**: Regular, engaging security awareness
3. **Clear Policies**: Easy-to-understand guidelines
4. **Positive Reinforcement**: Reward security-conscious behavior
5. **Open Communication**: Make reporting easy and safe

## Measuring Success

Track metrics like phishing simulation results, incident reports, and security training completion rates.
    `,
    category: "best-practices",
    author: {
      name: "Fatima El-Amin",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
      role: "Cloud Security Specialist",
    },
    publishedAt: "2024-11-15",
    readTime: "6 min read",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
  },
];

export const featuredPost = blogPosts.find((post) => post.featured);

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};