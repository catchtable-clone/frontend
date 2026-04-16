import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function Home() {
  return (
    <>
      <Header showSearch />
      <main className="flex-1 px-4 py-4">
        <p className="text-gray-500">홈 페이지</p>
      </main>
      <BottomNav />
    </>
  );
}
