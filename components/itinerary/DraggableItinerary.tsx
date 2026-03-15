"use client";

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface Activity {
    time: string;
    activity: string;
    location: string;
    notes: string;
    cost: string | number;
    lat?: number;
    long?: number;
}

interface SortableActivityProps {
    id: string;
    activity: Activity;
    index: number;
}

function SortableActivity({ id, activity, index }: SortableActivityProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style as any} className="relative">
            <div className={`flex gap-3 bg-secondary rounded-xl border border-border p-3.5 group hover:border-primary/30 transition-all ${isDragging ? 'shadow-2xl ring-2 ring-primary/30' : ''}`}>
                {}
                <button
                    {...attributes}
                    {...listeners}
                    className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5 touch-none"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {}
                <div className="flex-shrink-0">
                    <div className="w-14 text-center">
                        <div className="text-[10px] font-bold text-primary bg-primary/10 rounded-lg px-1.5 py-1">
                            {activity.time || `Stop ${index + 1}`}
                        </div>
                    </div>
                </div>

                {}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{activity.activity}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {activity.location && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary/60" /> {activity.location}
                            </span>
                        )}
                        {activity.cost && (
                            <span className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> {activity.cost}
                            </span>
                        )}
                    </div>
                    {activity.notes && (
                        <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{activity.notes}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DraggableDayProps {
    dayLabel: string;
    activities: Activity[];
    onReorder: (newActivities: Activity[]) => void;
}

export function DraggableDay({ dayLabel, activities, onReorder }: DraggableDayProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const ids = activities.map((_, i) => `${dayLabel}-${i}`);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = ids.indexOf(active.id as string);
            const newIndex = ids.indexOf(over?.id as string);
            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder(arrayMove(activities, oldIndex, newIndex));
            }
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {activities.map((activity, index) => (
                        <SortableActivity
                            key={ids[index]}
                            id={ids[index]}
                            activity={activity}
                            index={index}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

interface DraggableItineraryProps {
    itinerary: { day: string; activities: Activity[] }[];
    onUpdate?: (newItinerary: { day: string; activities: Activity[] }[]) => void;
}

export default function DraggableItinerary({ itinerary: initialItinerary, onUpdate }: DraggableItineraryProps) {
    const [itinerary, setItinerary] = useState(initialItinerary);

    const handleReorder = (dayIndex: number, newActivities: Activity[]) => {
        const updated = itinerary.map((day, i) =>
            i === dayIndex ? { ...day, activities: newActivities } : day
        );
        setItinerary(updated);
        onUpdate?.(updated);
    };

    return (
        <div className="space-y-6">
            {itinerary.map((day, dayIndex) => (
                <div key={day.day}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <h3 className="font-bold text-foreground">{day.day}</h3>
                        <span className="text-xs text-muted-foreground ml-auto">{day.activities.length} activities • drag to reorder</span>
                    </div>
                    <DraggableDay
                        dayLabel={day.day}
                        activities={day.activities}
                        onReorder={(newActs) => handleReorder(dayIndex, newActs)}
                    />
                </div>
            ))}
        </div>
    );
}
