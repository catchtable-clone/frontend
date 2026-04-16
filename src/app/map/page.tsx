import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function MapPage() {
  return (
    <>
      <Header title="지도" />
      <main className="flex-1 px-4 py-4">
        <p className="text-gray-500">지도 페이지</p>
      </main>
      <BottomNav />
    </>
  );
}
