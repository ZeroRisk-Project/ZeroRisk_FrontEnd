/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/src/components/layout/MainLayout";
import { Home } from "@/src/pages/Home";
import { Stocks } from "@/src/pages/Stocks";
import { Mypage } from "@/src/pages/Mypage";
import { MypageSettings } from "@/src/pages/MypageSettings";
import { AccountLinkFlow } from "@/src/pages/AccountLinkFlow";

import { Community } from "@/src/pages/Community";
import { CommunityPost } from "@/src/pages/CommunityPost";
import { CommunityWrite } from "@/src/pages/CommunityWrite";
import { CommunityStock } from "@/src/pages/CommunityStock";
import { Competitions } from "@/src/pages/Competitions";
import { CompetitionDetail } from "@/src/pages/CompetitionDetail";
import { CompetitionCreate } from "@/src/pages/CompetitionCreate";
import { Ranking } from "@/src/pages/Ranking";
import { Compare } from "@/src/pages/Compare";
import { Portfolio } from "@/src/pages/Portfolio";
import { Admin } from "@/src/pages/Admin";
import { PublicProfile } from "@/src/pages/PublicProfile";
import { Login } from "@/src/pages/Login";
import { Register } from "@/src/pages/Register";
import { ForgotPassword } from "@/src/pages/ForgotPassword";
import { OAuthSuccess } from "./pages/OAuthSuccess";

// New Footer Pages
import { About } from "@/src/pages/About";
import { CompetitionsGuide } from "@/src/pages/CompetitionsGuide";
import { Notice } from "@/src/pages/Notice";
import { Faq } from "@/src/pages/Faq";
import { Inquiry } from "@/src/pages/Inquiry";
import { Terms } from "@/src/pages/Terms";
import { Privacy } from "@/src/pages/Privacy";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="stocks/compare" element={<Compare />} />
          <Route path="stocks/:code" element={<Stocks />} />
          <Route path="mypage" element={<Mypage />} />
          <Route path="mypage/settings" element={<MypageSettings />} />
          <Route path="users/:id" element={<PublicProfile />} />
          <Route path="community" element={<Community />} />
          <Route path="community/write" element={<CommunityWrite />} />
          <Route path="community/stock/:code" element={<CommunityStock />} />
          <Route path="community/:id" element={<CommunityPost />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="competitions/guide" element={<CompetitionsGuide />} />
          <Route path="competitions/list" element={<Competitions />} />
          <Route path="competitions/create" element={<CompetitionCreate />} />
          <Route path="competitions/:id" element={<CompetitionDetail />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="about" element={<About />} />
          <Route path="notice" element={<Notice />} />
          <Route path="faq" element={<Faq />} />
          <Route path="inquiry" element={<Inquiry />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
        <Route path="admin" element={<Admin />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="oauth2/success" element={<OAuthSuccess />} />
        <Route path="account-link/*" element={<AccountLinkFlow />} />
      </Routes>
    </BrowserRouter>
  );
}
