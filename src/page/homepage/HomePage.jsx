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
import Hero from "../../components/PageComponent/Home/HeroComponent";
import Features from "../../components/PageComponent/Home/FeatureComponent";
import Courses from "../../components/PageComponent/Home/CourseComponent";
import Fees from "../../components/PageComponent/Home/FeesComponent";
import CTA from "../../components/PageComponent/Home/CTAComponent";

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

