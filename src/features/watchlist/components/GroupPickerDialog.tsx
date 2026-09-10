import { useState } from "react";
import { type WatchlistGroupResponse } from "@/src/features/watchlist/api/watchlist";

export interface GroupPickerDialogProps {
  open: boolean;
  groups: WatchlistGroupResponse[];
  onSelect: (groupId: number) => void;
  onCreateGroup: (name: string) => Promise<number | null>;
  onCancel: () => void;
}

export function GroupPickerDialog({ open, groups, onSelect, onCreateGroup, onCancel }: GroupPickerDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    const groupId = await onCreateGroup(name);
    if (groupId !== null) {
      setNewGroupName("");
      setIsCreating(false);
      onSelect(groupId);
    }
  };

  return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200"
        onClick={onCancel}
    >
      <div
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <h3 className="text-lg font-bold text-[#191F28] mb-1">어느 그룹에 추가할까요?</h3>
          <p className="text-[13px] text-[#8B95A1]">관심종목을 담을 그룹을 선택해 주세요.</p>
        </div>

        {groups.length > 0 && (
            <div className="max-h-[240px] overflow-y-auto px-3 space-y-1">
              {groups.map((group) => (
                  <button
                      key={group.groupId}
                      onClick={() => onSelect(group.groupId)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F2F4F6] text-[15px] font-semibold text-[#191F28] transition-colors"
                  >
                    {group.name}
                  </button>
              ))}
            </div>
        )}

        <div className="p-3">
          {isCreating ? (
              <div className="flex items-center gap-2">
                <input
                    autoFocus
                    maxLength={50}
                    placeholder="새 그룹 이름"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreate();
                      if (e.key === "Escape") setIsCreating(false);
                    }}
                    className="flex-1 h-10 px-3 bg-[#F2F4F6] rounded-xl text-sm outline-none"
                />
                <button
                    onClick={() => void handleCreate()}
                    className="h-10 px-3 rounded-xl bg-brand text-white text-sm font-bold shrink-0"
                >
                  추가
                </button>
              </div>
          ) : (
              <button
                  onClick={() => setIsCreating(true)}
                  className="w-full h-10 rounded-xl border border-dashed border-[#D1D6DB] text-[13px] font-bold text-[#8B95A1] hover:text-[#191F28] hover:border-[#8B95A1] transition-colors"
              >
                + 새 그룹 만들기
              </button>
          )}
        </div>

        <button
            onClick={onCancel}
            className="w-full py-3 text-[14px] font-medium text-[#8B95A1] border-t border-[#E5E8EB] active:bg-neutral-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
