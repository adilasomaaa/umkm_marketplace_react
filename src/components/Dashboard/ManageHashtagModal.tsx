import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import { Tag, Plus, Trash2, Edit3, Check, X, AlertCircle } from "lucide-react";
import { hashtagService } from "@/services/HashtagService";
import type { Hashtag } from "@/models";

interface ManageHashtagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokoId: number | undefined;
  onHashtagsChanged?: () => void;
}

const ManageHashtagModal: React.FC<ManageHashtagModalProps> = ({
  isOpen,
  onClose,
  tokoId,
  onHashtagsChanged,
}) => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newHashtagName, setNewHashtagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchHashtags = useCallback(async () => {
    if (!tokoId) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await hashtagService.index({
        tokoId,
        limit: 100,
      });
      setHashtags(response.data);
    } catch (err: any) {
      console.error("Gagal mengambil hashtag:", err);
      setErrorMsg("Gagal memuat hashtag. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [tokoId]);

  useEffect(() => {
    if (isOpen && tokoId) {
      fetchHashtags();
      setNewHashtagName("");
      setEditingId(null);
      setErrorMsg("");
    }
  }, [isOpen, tokoId, fetchHashtags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokoId || !newHashtagName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await hashtagService.create({
        tokoId,
        nama: newHashtagName.trim(),
      });
      setNewHashtagName("");
      await fetchHashtags();
      if (onHashtagsChanged) {
        onHashtagsChanged();
      }
    } catch (err: any) {
      console.error("Gagal membuat hashtag:", err);
      setErrorMsg(
        err?.message || "Gagal membuat hashtag. Mungkin nama sudah terdaftar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (hashtag: Hashtag) => {
    setEditingId(hashtag.id);
    setEditingName(hashtag.nama);
    setErrorMsg("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await hashtagService.update(id, {
        tokoId,
        nama: editingName.trim(),
      });
      setEditingId(null);
      setEditingName("");
      await fetchHashtags();
      if (onHashtagsChanged) {
        onHashtagsChanged();
      }
    } catch (err: any) {
      console.error("Gagal memperbarui hashtag:", err);
      setErrorMsg(
        err?.message || "Gagal memperbarui hashtag. Mungkin nama sudah terdaftar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus hashtag ini?")) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await hashtagService.delete(id);
      await fetchHashtags();
      if (onHashtagsChanged) {
        onHashtagsChanged();
      }
    } catch (err: any) {
      console.error("Gagal menghapus hashtag:", err);
      setErrorMsg(err?.message || "Gagal menghapus hashtag.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Tag className="w-5 h-5" />
                <span>Kelola Hashtag Toko</span>
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              {/* Form Add */}
              <form onSubmit={handleCreate} className="flex gap-2 items-end mb-4">
                <Input
                  label="Hashtag Baru"
                  placeholder="Contoh: Pedas, BestSeller..."
                  value={newHashtagName}
                  onChange={(e) => setNewHashtagName(e.target.value)}
                  disabled={isSubmitting}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    inputWrapper: "border-gray-300 dark:border-zinc-700 focus-within:border-primary",
                  }}
                />
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isSubmitting && !editingId}
                  isIconOnly
                  aria-label="Tambah Hashtag"
                  className="h-10 w-10 min-w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </form>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Hashtag List */}
              <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-2 bg-gray-50/50 dark:bg-zinc-900/30">
                <div className="text-xs font-semibold px-3 py-2 text-gray-500 border-b border-gray-100 dark:border-zinc-800 flex justify-between">
                  <span>Daftar Hashtag</span>
                  <span>{hashtags.length} item</span>
                </div>

                <div className="max-h-[300px] overflow-y-auto mt-2 space-y-1 pr-1 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Spinner size="sm" />
                      <span className="text-xs text-gray-400">Memuat data...</span>
                    </div>
                  ) : hashtags.length === 0 ? (
                    <div className="text-center py-10 text-sm text-gray-400 flex flex-col items-center gap-2">
                      <Tag className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                      <span>Belum ada hashtag di toko ini.</span>
                    </div>
                  ) : (
                    hashtags.map((hashtag) => (
                      <div
                        key={hashtag.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800/80 transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-800/50 group"
                      >
                        {editingId === hashtag.id ? (
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              size="sm"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              disabled={isSubmitting}
                              autoFocus
                              className="w-full"
                            />
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              isIconOnly
                              onPress={() => handleUpdate(hashtag.id)}
                              isLoading={isSubmitting && editingId === hashtag.id}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              isIconOnly
                              onPress={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">#</span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {hashtag.nama}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => handleStartEdit(hashtag)}
                                disabled={isSubmitting}
                                className="text-gray-500 hover:text-primary"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => handleDelete(hashtag.id)}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-100 dark:border-zinc-800">
              <Button color="default" variant="flat" onPress={onClose}>
                Tutup
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ManageHashtagModal;
