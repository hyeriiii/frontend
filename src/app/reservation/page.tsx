"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRooms } from "@/lib/api";
import { Room } from "@/types/reservation";

export default function ReservationPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        setError("스터디룸 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">스터디룸 예약</h1>

        <button
          onClick={() => router.push("/reservation/my")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          내 예약 보기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => router.push(`/reservation/${room.id}`)}
            className="cursor-pointer border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">
              {room.name}
            </h2>

            <p className="text-sm text-gray-600">
              {room.location} · {room.capacity}인
            </p>

            <p className="text-sm mt-2">
              {room.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {room.amenities.map((a) => (
                <span
                  key={a}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}