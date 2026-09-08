import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, ImagePlus, X } from 'lucide-react';
import { createPost, uploadImage } from '@/src/features/community/api/posts';

const MAX_IMAGES = 4;

export function CommunityWrite() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState('자유게시판');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSupported = category === '자유게시판';

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadImage(file)));
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (error) {
      console.error('이미지 업로드 실패', error);
      alert('이미지 업로드에 실패했습니다. (최대 5MB, jpg/png/gif/webp만 가능)');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isSupported) {
      alert('종목게시판 게시글 작성은 아직 준비 중입니다. 자유게시판을 이용해주세요.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await createPost({ boardType: 'FREE', title, content, imageUrls });
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

            <div className="bg-bg-main p-4 rounded-[16px] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm">이미지 첨부</span>
                  <p className="text-xs text-text-secondary mt-0.5">
                    최대 {MAX_IMAGES}장까지 첨부할 수 있어요 (장당 5MB 이하).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || imageUrls.length >= MAX_IMAGES}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-white border border-border-color text-sm font-bold hover:bg-border-color/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploading ? '업로드 중...' : '이미지 추가'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={url} className="relative w-20 h-20 rounded-[12px] overflow-hidden border border-border-color group">
                      <img src={url} alt={`첨부 이미지 ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
