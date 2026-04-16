import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function MyPage() {
  return (
    <>
      <Header title="마이페이지" />
      <main className="flex-1 px-4 py-4">
        <p className="text-gray-500">마이페이지</p>
      </main>
      <BottomNav />
    </>
  );
}
