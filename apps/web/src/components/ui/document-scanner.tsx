'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Camera, X, CheckCircle2 } from 'lucide-react';
import { recognizeImage, parseThaiIDCard, parsePassport } from '@/lib/ocr';

interface DocumentScannerProps {
    documentType: 'idCard' | 'passport' | 'visa';
    onScanComplete: (data: {
        nationalId?: string;
        firstName?: string;
        lastName?: string;
        firstNameEn?: string;
        lastNameEn?: string;
        birthDate?: string;
        address?: string;
        passport?: string;
        passportExpiry?: string;
        visaNo?: string;
        visaExpiry?: string;
        imageBase64?: string;
    }) => void;
    label: string;
}

export function DocumentScanner({ documentType, onScanComplete, label }: DocumentScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            processImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (imageData: string) => {
        setIsScanning(true);
        setScanStatus('idle');

        try {
            const text = await recognizeImage(imageData);
            console.log('OCR Result:', text);

            let parsedData: any = { imageBase64: imageData };

            if (documentType === 'idCard') {
                const idCardData = parseThaiIDCard(text);
                parsedData = { ...parsedData, ...idCardData };
            } else if (documentType === 'passport') {
                const passportData = parsePassport(text);
                parsedData = { ...parsedData, ...passportData };
            } else if (documentType === 'visa') {
                // Extract visa number - simple pattern matching
                const visaMatch = text.match(/(?:Visa|วีซ่า)[:\s]*([A-Z0-9]+)/i);
                if (visaMatch) {
                    parsedData.visaNo = visaMatch[1];
                }
                // Extract expiry
                const expiryMatch = text.match(/(?:Valid|Expiry|หมดอายุ)[:\s]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i);
                if (expiryMatch) {
                    const day = expiryMatch[1].padStart(2, '0');
                    const month = expiryMatch[2].padStart(2, '0');
                    const year = expiryMatch[3];
                    parsedData.visaExpiry = `${year}-${month}-${day}`;
                }
            }

            onScanComplete(parsedData);
            setScanStatus('success');
        } catch (error) {
            console.error('OCR Error:', error);
            setScanStatus('error');
            // Still pass the image even if OCR fails
            onScanComplete({ imageBase64: imageData });
        } finally {
            setIsScanning(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        setScanStatus('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-primary/50 transition-colors">
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Document preview"
                            className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        {isScanning && (
                            <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <span className="text-sm">กำลังอ่านเอกสาร...</span>
                                </div>
                            </div>
                        )}
                        {scanStatus === 'success' && !isScanning && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                อ่านสำเร็จ
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer text-center py-4"
                    >
                        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            {documentType === 'idCard' ? (
                                <Camera className="h-6 w-6 text-muted-foreground" />
                            ) : (
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            คลิกเพื่ออัปโหลดรูป
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            ระบบจะอ่านข้อมูลอัตโนมัติ
                        </p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}
