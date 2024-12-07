import { useGeoData } from "../../../contexts/GeoDataProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';

export default function LayersSection() {
    const { setBoundingBox, tiffUrls, renderArray, setRenderArray } = useGeoData();

    const toggleLayer = (key: keyof tiffUrls) => {
        const newLayer: LayerInstance = { id: generateUniqueId(), key };
        setRenderArray(prev => [...prev, newLayer]);
    };

    const removeLayer = (id: string) => {
        setRenderArray(prev => prev.filter(layer => layer.id !== id));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const reordered = Array.from(renderArray);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        setRenderArray(reordered);
    };

    const availableLayers = Object.keys(tiffUrls) as (keyof typeof tiffUrls)[];

    return (
        <div>

            {/* Available Layers List */}
            <div className="mb-4">
                <h4 className=" font-medium mb-2">Available Layers</h4>
                {availableLayers.map((layerKey) => (
                    <div key={layerKey} 
                         className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                         onClick={() => toggleLayer(layerKey)}>
                        <span>{layerKey}</span>
                        <Plus size={18} className="text-blue-500" />
                    </div>
                ))}
            </div>

            {/* Active Layers List */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="layers">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {renderArray.map((layer, index) => (
                                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                                    {(provided) => (
                                        <div
                                            className="flex items-center justify-between my-2 p-2 bg-gray-100 rounded"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <p>{layer.key}</p>
                                            <button
                                                className="px-2 py-1 rounded bg-red-500 text-white"
                                                onClick={() => removeLayer(layer.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    )
}

// Utility function to generate unique IDs
const generateUniqueId = () => `layer-${Math.random().toString(36).substr(2, 9)}`;
