"use client"

import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Link } from 'lucide-react'
export interface ExportItem {
    id: string;
    date: string;
    time: string;
    name: string;
    apiLink: string;
    size: string;
    resolution: string;
}

export const mockExports: ExportItem[] = [
    {
        id: '1',
        date: '2023-06-01',
        time: '14:30',
        name: 'Satellite_Image_001.tiff',
        apiLink: '/api/exports/1',
        size: '250 MB',
        resolution: '4096x4096',
    },
    {
        id: '2',
        date: '2023-06-02',
        time: '09:15',
        name: 'Terrain_Map_002.tiff',
        apiLink: '/api/exports/2',
        size: '180 MB',
        resolution: '3072x3072',
    },
    {
        id: '3',
        date: '2023-06-03',
        time: '11:45',
        name: 'Urban_Layout_003.tiff', //Can be PNG
        apiLink: '/api/exports/3',
        size: '320 MB',
        resolution: '5120x5120',
    },
];
export function OrderList() {
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    const toggleItem = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        )
    }

    const handleGetLink = (apiLink: string) => {
        // In a real application, this would generate or fetch a shareable link
        alert(`Generated link for: ${apiLink}`)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Export List</h1>
            <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
                {mockExports.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger onClick={() => toggleItem(item.id)} className="hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                                <span>{item.date} - {item.time}</span>
                                <span>{item.name}</span>
                                {expandedItems.includes(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Size</TableCell>
                                        <TableCell>{item.size}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Resolution</TableCell>
                                        <TableCell>{item.resolution}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>API Link</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span>{item.apiLink}</span>
                                                <Button variant="outline" size="sm" onClick={() => handleGetLink(item.apiLink)}>
                                                    <Link className="h-4 w-4 mr-2" />
                                                    Get Link
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

