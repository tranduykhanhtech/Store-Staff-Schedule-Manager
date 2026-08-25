import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StaffView } from './components/StaffView';
import { PaperworkView } from './components/PaperworkView';
import { AttendanceView } from './components/AttendanceView';
import { StaffModal } from './components/StaffModal';
import { ShiftModal } from './components/ShiftModal';
import { PaperworkModal } from './components/PaperworkModal';
import { PaperworkDetailModal } from './components/PaperworkDetailModal';
import { PrintScheduleModal } from './components/PrintScheduleModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { LoginView } from './components/LoginView';
import { StaffMember, Shift, PaperworkRecord, StoreInfo } from './types';
import { getWeekStart, formatDateToISO } from './utils/dateUtils';
import * as api from './services/api';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'schedule' | 'staff' | 'paperwork' | 'attendance'>('schedule');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Core Data States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [paperworkRecords, setPaperworkRecords] = useState<PaperworkRecord[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scheduling Week Reference
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  // Modals & Active Edit Entities
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftDefaultDate, setShiftDefaultDate] = useState<string | undefined>();
  const [shiftDefaultStaffId, setShiftDefaultStaffId] = useState<string | undefined>();

  const [isPaperworkModalOpen, setIsPaperworkModalOpen] = useState(false);
  const [editingPaperwork, setEditingPaperwork] = useState<PaperworkRecord | null>(null);
  const [paperworkDefaultStaffId, setPaperworkDefaultStaffId] = useState<string | undefined>();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectingRecord, setInspectingRecord] = useState<PaperworkRecord | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);

  // Paperwork view staff filter state
  const [paperworkStaffFilter, setPaperworkStaffFilter] = useState<string | undefined>();

  // Fetch data function
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.fetchAllData();
      setStaffList(data.staff || []);
      setShifts(data.shifts || []);
      setPaperworkRecords(data.paperwork || []);
      setStoreInfo(data.storeInfo);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data from Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Week Navigator Handlers
  const handleChangeWeek = (offset: number) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + offset * 7);
    setCurrentWeekStart(next);
  };

  const handleGoToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  // Staff Handlers
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (staff: StaffMember) => {
    // Optimistic Update
    setStaffList((prev) => {
      const idx = prev.findIndex((s) => s.id === staff.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = staff;
        return next;
      }
      return [...prev, staff];
    });

    try {
      await api.saveStaffToDB(staff);
    } catch (err) {
      alert("Lỗi khi lưu nhân viên vào database");
      loadData(); // Revert on error
    }
  };

  const handleSaveStoreInfo = async (info: StoreInfo) => {
    // Optimistic Update
    setStoreInfo(info);
    try {
      await api.saveStoreInfoToDB(info);
    } catch (err) {
      alert("Error saving store info");
      loadData(); // Revert on error
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này không?')) return;
    
    // Optimistic
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    setShifts((prev) => prev.filter((s) => s.staffId !== staffId));

    try {
      await api.deleteStaffFromDB(staffId);
    } catch (err) {
      alert("Lỗi khi xóa nhân viên");
      loadData();
    }
  };

  // Shift Handlers
  const handleOpenAddShift = (defaultDate?: string, defaultStaffId?: string) => {
    setEditingShift(null);
    setShiftDefaultDate(defaultDate);
    setShiftDefaultStaffId(defaultStaffId);
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (shift: Shift) => {
    // Optimistic
    setShifts((prev) => {
      const idx = prev.findIndex((s) => s.id === shift.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = shift;
        return next;
      }
      return [...prev, shift];
    });

    try {
      await api.saveShiftToDB(shift);
    } catch (err) {
      alert("Lỗi khi lưu ca làm việc");
      loadData();
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Bạn có chắc muốn xóa ca làm việc này?')) return;
    
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));

    try {
      await api.deleteShiftFromDB(shiftId);
    } catch (err) {
      alert("Lỗi khi xóa ca làm việc");
      loadData();
    }
  };

  const handleUpdateShiftStatus = async (shiftId: string, status: Shift['status']) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    const updatedShift = { ...shift, status };
    setShifts((prev) => prev.map((s) => (s.id === shiftId ? updatedShift : s)));

    try {
      await api.saveShiftToDB(updatedShift);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái");
      loadData();
    }
  };

  const handleCopyPreviousWeek = async () => {
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const prevDays: string[] = [];
    const currDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const p = new Date(prevWeekStart);
      p.setDate(prevWeekStart.getDate() + i);
      prevDays.push(formatDateToISO(p));

      const c = new Date(currentWeekStart);
      c.setDate(currentWeekStart.getDate() + i);
      currDays.push(formatDateToISO(c));
    }

    const prevWeekShifts = shifts.filter((s) => prevDays.includes(s.date));
    if (prevWeekShifts.length === 0) {
      alert('Không tìm thấy ca làm việc nào ở tuần trước để copy.');
      return;
    }

    if (!confirm(`Copy ${prevWeekShifts.length} ca làm việc từ tuần trước sang tuần này?`)) return;

    const newShifts: Shift[] = prevWeekShifts.map((s) => {
      const dayIndex = prevDays.indexOf(s.date);
      const targetDate = currDays[dayIndex] || s.date;
      return {
        ...s,
        id: `shift-${s.staffId}-${targetDate}-${s.startTime}-${Date.now().toString().slice(-4)}`,
        date: targetDate,
        status: 'scheduled',
      };
    });

    // Optimistic Update
    setShifts((prev) => {
      const filtered = prev.filter((s) => !currDays.includes(s.date));
      return [...filtered, ...newShifts];
    });

    try {
      for (const shift of newShifts) {
        await api.saveShiftToDB(shift);
      }
    } catch (err) {
      alert("Lỗi khi copy dữ liệu. Tải lại trang để đồng bộ.");
      loadData();
    }
  };

  const handleClearWeekShifts = async () => {
    const currDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const c = new Date(currentWeekStart);
      c.setDate(currentWeekStart.getDate() + i);
      currDays.push(formatDateToISO(c));
    }

    const shiftsToDelete = shifts.filter(s => currDays.includes(s.date));
    
    if (confirm('Bạn có chắc muốn xóa TOÀN BỘ ca làm việc của tuần này?')) {
      // Optimistic
      setShifts((prev) => prev.filter((s) => !currDays.includes(s.date)));

      try {
        for (const shift of shiftsToDelete) {
          await api.deleteShiftFromDB(shift.id);
        }
      } catch (err) {
        alert("Lỗi khi xóa dữ liệu.");
        loadData();
      }
    }
  };

  // Paperwork Handlers
  const handleOpenAddPaperwork = (defaultStaffId?: string) => {
    setEditingPaperwork(null);
    setPaperworkDefaultStaffId(defaultStaffId);
    setIsPaperworkModalOpen(true);
  };

  const handleEditPaperwork = (record: PaperworkRecord) => {
    setEditingPaperwork(record);
    setIsPaperworkModalOpen(true);
  };

  const handleSavePaperwork = async (record: PaperworkRecord) => {
    // Optimistic
    setPaperworkRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    try {
      await api.savePaperworkToDB(record);
    } catch (err) {
      alert("Lỗi khi lưu hồ sơ");
      loadData();
    }
  };

  const handleDeletePaperwork = async (recordId: string) => {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    
    // Optimistic
    setPaperworkRecords((prev) => prev.filter((r) => r.id !== recordId));

    try {
      await api.deletePaperworkFromDB(recordId);
    } catch (err) {
      alert("Lỗi khi xóa hồ sơ");
      loadData();
    }
  };

  const handleViewPaperworkDetails = (record: PaperworkRecord) => {
    setInspectingRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleToggleSignature = async (recordId: string) => {
    const record = paperworkRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const isSigned = !record.signedByStaff;
    const updatedRecord = {
      ...record,
      signedByStaff: isSigned,
      signedAt: isSigned ? new Date().toISOString().split('T')[0] : undefined,
      status: isSigned && record.status === 'pending_review' ? 'valid' : record.status,
    };
    
    // Optimistic
    setPaperworkRecords((prev) => prev.map((r) => r.id === recordId ? updatedRecord : r));

    try {
      await api.savePaperworkToDB(updatedRecord);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái ký");
      loadData();
    }
  };

  // Staff to Paperwork Bridge
  const handleViewPaperworkForStaff = (staffId: string) => {
    setPaperworkStaffFilter(staffId);
    setActiveTab('paperwork');
  };

  const handleResetData = () => {
    loadData();
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse">Đang tải dữ liệu hệ thống...</div>
      </div>
    );
  }

  if (error || !storeInfo) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-xl text-rose-600 max-w-lg text-center bg-white p-8 rounded-2xl shadow-sm border border-rose-100">
          <p className="font-bold mb-2">Không thể kết nối đến máy chủ dữ liệu</p>
          <p className="text-sm text-slate-600">{error || 'Vui lòng kiểm tra lại kết nối mạng.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Header
        storeInfo={storeInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddStaff={handleOpenAddStaff}
        onOpenAddShift={() => handleOpenAddShift()}
        onOpenAddPaperwork={() => handleOpenAddPaperwork()}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onResetData={handleResetData}
        onOpenStoreSettings={() => setIsStoreSettingsOpen(true)}
        paperworkRecords={paperworkRecords}
        totalStaffCount={staffList.filter((s) => s.status === 'active').length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'schedule' && (
          <ScheduleView
            currentWeekStart={currentWeekStart}
            onChangeWeek={handleChangeWeek}
            onGoToCurrentWeek={handleGoToCurrentWeek}
            shifts={shifts}
            staffList={staffList}
            storeInfo={storeInfo}
            onOpenAddShift={handleOpenAddShift}
            onEditShift={handleEditShift}
            onDeleteShift={handleDeleteShift}
            onCopyPreviousWeek={handleCopyPreviousWeek}
            onClearWeekShifts={handleClearWeekShifts}
          />
        )}

        {activeTab === 'staff' && (
          <StaffView
            staffList={staffList}
            paperworkRecords={paperworkRecords}
            allShifts={shifts}
            onOpenAddStaff={handleOpenAddStaff}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteStaff}
            onOpenAddShiftForStaff={(staffId) => handleOpenAddShift(undefined, staffId)}
            onViewPaperworkForStaff={handleViewPaperworkForStaff}
            onAddPaperworkForStaff={(staffId) => handleOpenAddPaperwork(staffId)}
          />
        )}

        {activeTab === 'paperwork' && (
          <PaperworkView
            paperworkRecords={paperworkRecords}
            staffList={staffList}
            onOpenAddPaperwork={handleOpenAddPaperwork}
            onEditPaperwork={handleEditPaperwork}
            onDeletePaperwork={handleDeletePaperwork}
            onViewPaperworkDetails={handleViewPaperworkDetails}
            onToggleSignature={handleToggleSignature}
            selectedStaffIdFilter={paperworkStaffFilter}
            onClearStaffFilter={() => setPaperworkStaffFilter(undefined)}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            shifts={shifts}
            staffList={staffList}
            storeInfo={storeInfo}
            onUpdateShiftStatus={handleUpdateShiftStatus}
            onOpenAddShift={(date) => handleOpenAddShift(date)}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{storeInfo.name}</strong> • Store Management Portal & Compliance Archive
          </div>
          <div className="flex items-center gap-3">
            <span>Roles: Crewmember, Cashier, Supervisor, Assistant Manager, Store Manager</span>
          </div>
        </div>
      </footer>

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleSaveStaff}
        editingStaff={editingStaff}
      />

      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
        editingShift={editingShift}
        staffList={staffList.filter((s) => s.status === 'active')}
        allShifts={shifts}
        defaultDate={shiftDefaultDate}
        defaultStaffId={shiftDefaultStaffId}
      />

      <PaperworkModal
        isOpen={isPaperworkModalOpen}
        onClose={() => setIsPaperworkModalOpen(false)}
        onSave={handleSavePaperwork}
        editingRecord={editingPaperwork}
        staffList={staffList}
        defaultStaffId={paperworkDefaultStaffId}
      />

      <PaperworkDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={inspectingRecord}
        staff={inspectingRecord ? staffList.find((s) => s.id === inspectingRecord.staffId) : undefined}
        onEdit={(rec) => {
          setIsDetailModalOpen(false);
          handleEditPaperwork(rec);
        }}
        onToggleSign={handleToggleSignature}
      />

      <PrintScheduleModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        weekStart={currentWeekStart}
        shifts={shifts}
        staffList={staffList}
        storeInfo={storeInfo}
      />

      <StoreSettingsModal
        isOpen={isStoreSettingsOpen}
        onClose={() => setIsStoreSettingsOpen(false)}
        onSave={handleSaveStoreInfo}
        currentInfo={storeInfo}
      />
    </div>
  );
}
