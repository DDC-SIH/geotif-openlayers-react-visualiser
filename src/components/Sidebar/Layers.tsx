import { useGeoData } from "../../../contexts/GeoDataProvider";
import { DndProvider, useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus } from 'lucide-react';
import React from "react";

interface DraggableItem {
    id: string;
    index: number;
    type: string;
}

const ItemType = {
    LAYER: "LAYER",
};

export default function LayersSection() {
    const { setBoundingBox, tiffUrls, renderArray, setRenderArray } = useGeoData();

    const toggleLayer = (key: keyof typeof tiffUrls) => {
        const newLayer = { id: generateUniqueId(), key };
        setRenderArray((prev) => [...prev, newLayer]);
    };

    const removeLayer = (id: string) => {
        setRenderArray((prev) => prev.filter((layer) => layer.id !== id));
    };

    const moveLayer = (dragIndex: number, hoverIndex: number) => {
        const reordered = [...renderArray];
        const [movedItem] = reordered.splice(dragIndex, 1);
        reordered.splice(hoverIndex, 0, movedItem);
        setRenderArray(reordered);
    };

    const availableLayers = Object.keys(tiffUrls) as (keyof typeof tiffUrls)[];

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                {/* Available Layers List */}
                <div className="mb-4">
                    <h4 className="font-medium mb-2">Available Layers</h4>
                    {availableLayers.map((layerKey) => (
                        <div
                            key={layerKey}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => toggleLayer(layerKey)}
                        >
                            <span>{layerKey}</span>
                            <Plus size={18} className="text-blue-500" />
                        </div>
                    ))}
                </div>

                {/* Active Layers List */}
                <div>
                    {renderArray.map((layer, index) => (
                        <DraggableLayer
                            key={layer.id}
                            layer={layer}
                            index={index}
                            moveLayer={moveLayer}
                            removeLayer={removeLayer}
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
}

// Draggable Layer Component
function DraggableLayer({
    layer,
    index,
    moveLayer,
    removeLayer,
}: {
    layer: { id: string; key: string };
    index: number;
    moveLayer: (dragIndex: number, hoverIndex: number) => void;
    removeLayer: (id: string) => void;
}) {
    const ref = React.useRef<HTMLDivElement>(null);

    const [, drop] = useDrop<DraggableItem>({
        accept: ItemType.LAYER,
        hover(item: DraggableItem, monitor) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

            if (
                (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
                (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
            ) {
                return;
            }

            moveLayer(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemType.LAYER,
        item: { id: layer.id, index },
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`flex items-center justify-between p-2 my-2 bg-gray-100 rounded ${
                isDragging ? "opacity-50" : "opacity-100"
            }`}
        >
            <p>{layer.key}</p>
            <button
                className="px-2 py-1 rounded bg-red-500 text-white"
                onClick={() => removeLayer(layer.id)}
            >
                Remove
            </button>
        </div>
    );
}

// Utility function to generate unique IDs
const generateUniqueId = () => `layer-${Math.random().toString(36).substr(2, 9)}`;
