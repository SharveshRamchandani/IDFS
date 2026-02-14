import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconUpload, IconFileSpreadsheet, IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { uploadSalesData } from "@/lib/api";

export default function DataUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStats, setUploadStats] = useState<any | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStats(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadSalesData(file);
            setUploadStats(result);
            toast.success(`Successfully added ${result.added_rows} rows!`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <DashboardLayout title="Data Management">
            <div className="space-y-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconFileSpreadsheet className="h-6 w-6 text-primary" />
                            Upload Sales Data
                        </CardTitle>
                        <CardDescription>
                            Upload your historical sales data (CSV) to train the forecasting model.
                            <br />
                            Required columns: <code>date, sku, store_id, quantity</code>.
                            <br />
                            Optional columns: <code>price, category, onpromotion</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Sales Data (CSV/Excel)</Label>
                            <Input id="picture" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                        </div>

                        {file && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                <IconFileSpreadsheet className="h-4 w-4" />
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </div>
                        )}

                        <Button onClick={handleUpload} disabled={isUploading || !file} className="w-full">
                            {isUploading ? (
                                <>
                                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading & Processing...
                                </>
                            ) : (
                                <>
                                    <IconUpload className="mr-2 h-4 w-4" />
                                    Upload Data
                                </>
                            )}
                        </Button>

                        {uploadStats && (
                            <div className="mt-6 p-4 border rounded-lg bg-success/10 border-success/20">
                                <div className="flex items-center gap-2 text-success font-semibold mb-2">
                                    <IconCircleCheck className="h-5 w-5" />
                                    Upload Complete
                                </div>
                                <ul className="text-sm space-y-1">
                                    <li>Added Rows: <strong>{uploadStats.added_rows}</strong></li>
                                    <li>Skipped (Duplicates): <strong>{uploadStats.skipped_rows}</strong></li>
                                    {uploadStats.errors?.length > 0 && (
                                        <li className="text-destructive mt-2">
                                            Errors: {uploadStats.errors.length} (Check console for details)
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
