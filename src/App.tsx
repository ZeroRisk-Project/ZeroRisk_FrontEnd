/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/src/shared/components/layout/MainLayout";
import { GlobalNoticePopup } from "@/src/features/systemnotice/components/GlobalNoticePopup";
import { Home } from "@/src/pages/Home";
import { Stocks } from "@/src/features/stock/pages/Stocks";
import { Mypage } from "@/src/features/user/pages/Mypage";
import { MypageSettings } from "@/src/features/user/pages/MypageSettings";
import { AccountLinkFlow } from "@/src/features/openbanking/pages/AccountLinkFlow";

import { Community } from "@/src/features/community/pages/Community";
import { CommunityPost } from "@/src/features/community/pages/CommunityPost";
import { CommunityWrite } from "@/src/features/community/pages/CommunityWrite";
import { CommunityStock } from "@/src/features/community/pages/CommunityStock";
import { Competitions } from "@/src/features/competition/pages/Competitions";
import { CompetitionDetail } from "@/src/features/competition/pages/CompetitionDetail";
import { CompetitionCreate } from "@/src/features/competition/pages/CompetitionCreate";
import { Ranking } from "@/src/features/ranking/pages/Ranking";
import { Compare } from "@/src/features/stock/pages/Compare";
import { Portfolio } from "@/src/features/portfolio/pages/Portfolio";
import { Admin } from "@/src/features/admin/pages/Admin";
import { PublicProfile } from "@/src/features/user/pages/PublicProfile";
import { Login } from "@/src/features/auth/pages/Login";
import { Register } from "@/src/features/auth/pages/Register";
import { Onboarding } from "@/src/features/auth/pages/Onboarding";
import { ForgotPassword } from "@/src/features/auth/pages/ForgotPassword";
import { OAuthSuccess } from "@/src/features/auth/pages/OAuthSuccess";

// New Footer Pages
import { About } from "@/src/pages/About";
import { CompetitionsGuide } from "@/src/features/competition/pages/CompetitionsGuide";
import { Notice } from "@/src/features/announcement/pages/Notice";
import { Faq } from "@/src/pages/Faq";
import { Inquiry } from "@/src/features/inquiry/pages/Inquiry";
import { Terms } from "@/src/pages/Terms";
import { Privacy } from "@/src/pages/Privacy";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalNoticePopup />
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
        <Route path="start" element={<Onboarding />} />
        <Route path="account-link/*" element={<AccountLinkFlow />} />
      </Routes>
    </BrowserRouter>
  );
}
