"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createReservation,
  fetchRoom,
  fetchRoomReservations,
} from "@/lib/api";
import { Room, Reservation } from "@/types/reservation";

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [purpose, setPurpose] = useState("");
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const loadData = async () => {
    try {
      const roomData = await fetchRoom(roomId);
      const reservationData = await fetchRoomReservations(roomId, date);

      setRoom(roomData);
      setReservations(reservationData);
    } catch (error) {
      console.error(error);
      setMessage("스터디룸 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const getReservationForSlot = (time: string) => {
    return reservations.find((r) => r.startTime <= time && r.endTime > time);
  };

  const handleSlotClick = (time: string) => {
    if (getReservationForSlot(time)) return;

    if (!isLoggedIn) {
      setMessage("로그인 후 예약할 수 있습니다.");
      return;
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(time);

      const nextHour = `${(parseInt(time) + 1).toString().padStart(2, "0")}:00`;
      setSelectedEnd(nextHour);
      return;
    }

    const endTime = `${(parseInt(time) + 1).toString().padStart(2, "0")}:00`;

    if (endTime > selectedStart) {
      setSelectedEnd(endTime);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedStart || !selectedEnd) {
      setMessage("예약 시간을 선택해주세요.");
      return;
    }

    if (!purpose.trim()) {
      setMessage("예약 목적을 입력해주세요.");
      return;
    }

    try {
      await createReservation({
        roomId,
        date,
        startTime: selectedStart,
        endTime: selectedEnd,
        purpose,
      });

      setMessage("예약이 완료되었습니다.");
      setPurpose("");
      setSelectedStart(null);
      setSelectedEnd(null);
      loadData();
    } catch (error) {
      console.error(error);
      setMessage("예약에 실패했습니다. 시간 충돌이 있을 수 있습니다.");
    }
  };

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (!room) {
    return <div className="p-4">스터디룸이 없습니다.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{room.name}</h1>

      <p className="text-gray-600 mb-1">{room.location}</p>
      <p className="text-gray-600 mb-4">수용 인원: {room.capacity}명</p>

      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setSelectedStart(null);
          setSelectedEnd(null);
        }}
        className="border px-3 py-2 rounded mb-6"
      />

      <div className="space-y-2 mb-6">
        {TIME_SLOTS.map((time) => {
          const reservation = getReservationForSlot(time);

          const isSelected =
            selectedStart && selectedEnd && time >= selectedStart && time < selectedEnd;

          return (
            <div
              key={time}
              onClick={() => handleSlotClick(time)}
              className={`flex items-center border-b p-3 ${
                reservation
                  ? "bg-gray-200 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-100 cursor-pointer"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <span className="w-16 font-mono text-sm">{time}</span>

              <span className="flex-1 text-sm">
                {reservation
                  ? `${reservation.purpose} (${reservation.username})`
                  : isSelected
                  ? "선택됨"
                  : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border rounded-lg p-4">
        <p className="mb-2 text-sm">
          선택 시간: {selectedStart || "-"} ~ {selectedEnd || "-"}
        </p>

        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="예약 목적을 입력하세요"
          className="border px-3 py-2 rounded w-full mb-3"
        />

        <button
          onClick={handleCreateReservation}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          예약하기
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}