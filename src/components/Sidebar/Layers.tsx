import { useGeoData } from "../../../contexts/GeoDataProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

    return (
        <div>
            <h3 className="font-semibold mb-4">Information</h3>
            <p className="my-2">Render Meta Data Here</p>
            <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => toggleLayer('VIS')}
            >
                Add VIS Layer
            </button>
            <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => toggleLayer('TIR1')}
            >
                Add TIR1 Layer
            </button>
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
