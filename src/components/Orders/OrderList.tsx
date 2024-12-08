"use client"

import { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Link } from 'lucide-react'
import { getDownloads } from "../../api-client";

export interface ExportItem {
    id: string;
    date: string;
    time: string;
    name: string;
    apiLink: string;
    size: string;
    resolution: string;
}

interface DownloadItem {
    downloadDateTime: string;
    downloadObject: {
        selectedBands: {
            [date: string]: {
                [time: string]: {
                    [band: string]: string;
                }
            }
        };
        processingLevel: string;
        startDate: string;
        endDate: string;
    };
    isAuthorized: boolean;
}

export function OrderList() {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDownloads();
                setDownloads(result);
            } catch (error: any) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleItem = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
    if (error) return <div className="container mx-auto p-4">Error: {error}</div>;
    if (!downloads.length) return <div className="container mx-auto p-4">No downloads found</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Download History</h1>
            <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
                {downloads.map((item, index) => {
                    const { date, time } = formatDateTime(item.downloadDateTime);
                    return (
                        <AccordionItem key={index} value={index.toString()}>
                            <AccordionTrigger onClick={() => toggleItem(index.toString())} className="hover:no-underline">
                                <div className="flex justify-between items-center w-full">
                                    <span>{date} - {time}</span>
                                    <span>Processing Level: {item.downloadObject.processingLevel}</span>
                                    {expandedItems.includes(index.toString()) ? 
                                        <ChevronUp className="h-4 w-4" /> : 
                                        <ChevronDown className="h-4 w-4" />}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Band</TableHead>
                                            <TableHead>Link</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(item.downloadObject.selectedBands).map(([date, times]) => 
                                            Object.entries(times).map(([time, bands]) =>
                                                Object.entries(bands).map(([band, link], bandIndex) => (
                                                    <TableRow key={`${date}-${time}-${band}`}>
                                                        <TableCell>{date}</TableCell>
                                                        <TableCell>{time}</TableCell>
                                                        <TableCell>{band}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="truncate max-w-[300px]">{link}</span>
                                                                {link !== "string" && (
                                                                    <Button variant="outline" size="sm" onClick={() => window.open(link, '_blank')}>
                                                                        <Link className="h-4 w-4 mr-2" />
                                                                        Open Link
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}

