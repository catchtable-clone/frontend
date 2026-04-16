import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function Bookmarks() {
  return (
    <>
      <Header title="즐겨찾기" />
      <main className="flex-1 px-4 py-4">
        <p className="text-gray-500">즐겨찾기 페이지</p>
      </main>
      <BottomNav />
    </>
  );
}
