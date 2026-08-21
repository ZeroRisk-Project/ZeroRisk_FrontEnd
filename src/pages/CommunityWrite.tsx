import React, { useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { createPost } from '@/src/api/posts';

export function CommunityWrite() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('자유게시판');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProfitCert, setIsProfitCert] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSupported = category === '자유게시판';

  const handleSubmit = async () => {
    if (!isSupported) {
      alert('종목게시판/수익률 인증 게시글 작성은 아직 준비 중입니다. 자유게시판을 이용해주세요.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // 수익률 인증(isProfitCert)은 별도 API(POST /posts/profit-cert) 미구현으로,
      // 체크했더라도 일반 자유게시판 글로 등록됨 (추후 확장 지점)
      await createPost({ boardType: 'FREE', title, content });
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패', error);
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link to="/community" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
      </Link>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border-color pb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-brand" /> 게시글 작성
            </h1>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                className="bg-bg-main border border-border-color rounded-[16px] px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-brand w-[150px]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>자유게시판</option>
                <option>종목게시판</option>
                <option>수익률 인증</option>
              </select>
              <input
                className="flex-1 bg-bg-main border border-border-color rounded-[16px] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand font-medium placeholder:text-text-secondary"
                placeholder="제목을 입력하세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {!isSupported && (
              <p className="text-xs text-down font-medium">
                ⚠️ {category}는 아직 준비 중인 기능입니다. 자유게시판으로 작성해주세요.
              </p>
            )}

            <div className="border border-border-color rounded-[16px] overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-brand transition-all">
              <div className="bg-bg-main border-b border-border-color p-2 flex gap-2">
                <button type="button" className="px-3 py-1 rounded-[8px] hover:bg-border-color text-sm font-semibold transition-colors">
                  B
                </button>
                <button type="button" className="px-3 py-1 rounded-[8px] hover:bg-border-color text-sm font-semibold italic transition-colors">
                  I
                </button>
                <button type="button" className="px-3 py-1 rounded-[8px] hover:bg-border-color text-sm font-semibold underline transition-colors">
                  U
                </button>
              </div>
              <textarea
                className="w-full h-[400px] p-4 outline-none resize-none text-sm bg-surface"
                placeholder="내용을 입력하세요. 타인에 대한 비방이나 모욕은 자제해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center bg-bg-main p-4 rounded-[16px]">
              <div>
                <span className="font-semibold text-sm">수익률 인증 첨부</span>
                <p className="text-xs text-text-secondary mt-0.5">내 계좌의 현재 수익률을 캡처본 없이 인증할 수 있습니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isProfitCert}
                  onChange={(e) => setIsProfitCert(e.target.checked)}
                />
                <div className="w-11 h-6 bg-border-color peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link to="/community">
              <Button variant="secondary" className="px-8">
                취소
              </Button>
            </Link>
            <Button className="px-8" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}