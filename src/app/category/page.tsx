import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function Category() {
  return (
    <>
      <Header showSearch />
      <main className="flex-1 px-4 py-4">
        <p className="text-gray-500">카테고리 페이지</p>
      </main>
      <BottomNav />
    </>
  );
}
