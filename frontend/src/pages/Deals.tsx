/**
 * DEALS PIPELINE (KANBAN BOARD)
 * This file implements the visual transaction tracking system.
 * Features:
 * - Drag-and-drop interface using @hello-pangea/dnd.
 * - Real-time synchronization with the Express/Prisma backend.
 * - Integration with Property and Client data.
 * - Optimistic UI updates for zero-latency feel.
 */

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Loader2, TrendingUp, User, DollarSign, Building2, ChevronRight } from 'lucide-react';
import api from '../utils/api';

// --- TYPESCRIPT INTERFACES ---
interface Property {
  title: string;
  price: number;
}

interface Client {
  name: string;
}

interface Deal {
  id: string;
  stage: 'NEGOTIATION' | 'AGREEMENT' | 'CLOSED';
  property: Property;
  client: Client;
  createdAt: string;
}

const STAGES: Deal['stage'][] = ['NEGOTIATION', 'AGREEMENT', 'CLOSED'];

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deals from backend
  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals');
      setDeals(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch deals:", err);
      setError("Could not load the pipeline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Handle the logic when a card is dropped into a new column
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Drop outside or same position check
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStage = destination.droppableId as Deal['stage'];

    // 1. OPTIMISTIC UPDATE: Update UI immediately
    const originalDeals = [...deals];
    const updatedDeals = deals.map((deal) => 
      deal.id === draggableId ? { ...deal, stage: newStage } : deal
    );
    setDeals(updatedDeals);

    // 2. BACKEND SYNC
    try {
      await api.patch(`/deals/${draggableId}/stage`, { stage: newStage });
      
      // If deal is closed, refresh to trigger any backend commission logic/notifications
      if (newStage === 'CLOSED') {
        fetchDeals();
      }
    } catch (err) {
      console.error("Failed to update deal stage:", err);
      setDeals(originalDeals); // Rollback on error
      alert("Failed to update the deal status on the server.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-purple-600">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="text-gray-500 font-medium">Syncing Deal Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Deal Pipeline</h1>
          <p className="text-gray-500">Track transactions and revenue growth.</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Transactions</span>
          <p className="text-xl font-bold text-purple-600">{deals.length}</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 min-h-[75vh] scrollbar-hide">
          {STAGES.map((stage) => (
            <div key={stage} className="bg-slate-50 rounded-2xl p-4 w-80 flex-shrink-0 flex flex-col border border-slate-200/60 shadow-sm">
              <div className="flex justify-between items-center mb-5 px-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {stage}
                </h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {deals.filter((d) => d.stage === stage).length}
                </span>
              </div>
              
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-4 rounded-xl transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-slate-100/50' : ''
                    }`}
                  >
                    {deals
                      .filter((d) => d.stage === stage)
                      .map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style }}
                              className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-purple-200 group ${
                                snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl border-purple-400 z-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                  <Building2 size={16} />
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-400" />
                              </div>

                              <h4 className="font-bold text-slate-800 mt-4 group-hover:text-purple-700 transition-colors line-clamp-1">
                                {deal.property?.title || 'Untitled Listing'}
                              </h4>
                              
                              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                  <User size={10} />
                                </div>
                                <span>{deal.client?.name}</span>
                              </div>
                              
                              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center text-purple-600 font-extrabold text-base">
                                  <DollarSign size={14} className="mt-0.5" />
                                  <span>{deal.property?.price?.toLocaleString()}</span>
                                </div>
                                <TrendingUp size={16} className="text-slate-300" />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Deals;