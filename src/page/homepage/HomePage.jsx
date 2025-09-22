// KoreanHomepage.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Headphones,
  MessageCircle,
  BookOpen,
  Crown,
  PlayCircle,
  Rocket,
  Users,
  Trophy,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import listeningImg from "../../assets/study.png";
import speakingImg from "../../assets/talk.png";
import vocabImg from "../../assets/text.png";
import roadmapImg from "../../assets/goal.png";


// import section 
import Hero from "../homepage/homeComponent/HeroComponent";
import Features from "../homepage/homeComponent/FeatureComponent";
import Courses from "../homepage/homeComponent/CourseComponent";
import Fees from "../homepage/homeComponent/FeesComponent";
import CTA from "../homepage/homeComponent/CTAComponent";

const PRIMARY = "#008236";


export default function KoreanHomepage() {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <Courses />
      <Fees />
      <CTA />
     
    </MainLayout>
  );
}

