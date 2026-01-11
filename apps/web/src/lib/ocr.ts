'use client';

import { createWorker, Worker } from 'tesseract.js';

// Singleton worker instance
let worker: Worker | null = null;

export async function getOCRWorker(): Promise<Worker> {
    if (!worker) {
        worker = await createWorker('tha+eng');
    }
    return worker;
}

export async function recognizeImage(imageData: string | File): Promise<string> {
    const ocrWorker = await getOCRWorker();
    const result = await ocrWorker.recognize(imageData);
    return result.data.text;
}

// Parse Thai ID Card
export function parseThaiIDCard(text: string): {
    nationalId?: string;
    firstName?: string;      // Thai first name
    lastName?: string;       // Thai last name
    firstNameEn?: string;    // English first name
    lastNameEn?: string;     // English last name
    birthDate?: string;
    address?: string;
} {
    const result: any = {};
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Extract 13-digit national ID - try multiple patterns
    const idPatterns = [
        /\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d/,
        /(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)\s*(\d)/,
        /\d{13}/
    ];

    for (const pattern of idPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.nationalId = match[0].replace(/[\s-]/g, '');
            if (result.nationalId.length === 13) break;
        }
    }

    // ====== ENGLISH NAME ======
    // Extract English first name - look for "Name" followed by Mr./Mrs./Miss and name
    const engNamePattern = /Name\s+(?:Mr\.|Mrs\.|Miss\.|Ms\.?)?\s*([A-Za-z]+)/i;
    const engNameMatch = text.match(engNamePattern);
    if (engNameMatch) {
        result.firstNameEn = engNameMatch[1];
    }

    // Extract English last name
    const engLastNamePattern = /Last\s*name\s+([A-Za-z]+)/i;
    const engLastNameMatch = text.match(engLastNamePattern);
    if (engLastNameMatch) {
        result.lastNameEn = engLastNameMatch[1];
    }

    // ====== THAI NAME ======
    // Look for pattern: ชื่อตัวและชื่อสกุล นาย/นาง/น.ส. ชื่อ สกุล
    const thaiFullNamePattern = /(?:ชื่อตัวและชื่อสกุล|ชื่อ)\s*(?:นาย|นาง|น\.ส\.|นางสาว)?\s*([ก-๙]+)\s+([ก-๙]+)/;
    const thaiFullNameMatch = text.match(thaiFullNamePattern);
    if (thaiFullNameMatch) {
        result.firstName = thaiFullNameMatch[1];
        result.lastName = thaiFullNameMatch[2];
    }

    // Alternative: Separate patterns for Thai names
    if (!result.firstName) {
        const thaiNamePattern = /(?:นาย|นาง|น\.ส\.|นางสาว)\s*([ก-๙]+)/;
        const thaiNameMatch = text.match(thaiNamePattern);
        if (thaiNameMatch) {
            result.firstName = thaiNameMatch[1];
        }
    }

    // ====== BIRTH DATE ======
    const birthPatterns = [
        /Date\s*of\s*Birth\s*(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})/i,
        /เกิดวันที่\s*(\d{1,2})\s*([ก-๙\.]+)\s*(\d{4})/,
        /(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{4})/
    ];

    const monthMap: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
        'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
        'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
        'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
    };

    for (const pattern of birthPatterns) {
        const match = text.match(pattern);
        if (match) {
            const day = match[1].padStart(2, '0');
            let month = match[2].toLowerCase().substring(0, 3);
            month = monthMap[month] || monthMap[match[2]] || match[2].padStart(2, '0');
            let year = parseInt(match[3]);
            // Convert Buddhist year to AD if needed
            if (year > 2500) {
                year -= 543;
            }
            result.birthDate = `${year}-${month}-${day}`;
            break;
        }
    }

    // ====== ADDRESS ======
    // Look for "ที่อยู่" prefix and capture everything after it
    const addressStartPattern = /(?:ที่อยู่|ที่อยู)\s*(.+)/i;
    const addressStartMatch = text.match(addressStartPattern);
    if (addressStartMatch) {
        result.address = addressStartMatch[1].trim();
    }

    // Better pattern: Find address block with หมู่ที่, ต., อ., จ.
    if (!result.address) {
        // Match Thai address pattern: number/number หมู่ที่ X ต.XXX อ.XXX จ.XXX
        const fullAddressPattern = /(\d+\/?\d*\s+หมู่(?:ที่)?\s*\d+\s+(?:ต\.|ตำบล)[^\n]+(?:\s+(?:อ\.|อำเภอ)[^\n]+)?(?:\s+(?:จ\.|จังหวัด)[^\n]+)?)/i;
        const fullAddressMatch = text.match(fullAddressPattern);
        if (fullAddressMatch) {
            result.address = fullAddressMatch[1].replace(/\n/g, ' ').trim();
        }
    }

    // Alternative: Capture lines that look like address
    if (!result.address) {
        const addressLines: string[] = [];
        let capturing = false;
        for (const line of lines) {
            // Start capturing at number/number pattern or ที่อยู่
            if (line.match(/^\d+\/\d+/) || line.match(/ที่อยู่/)) {
                capturing = true;
            }
            if (capturing) {
                addressLines.push(line);
                // Stop at date lines
                if (line.match(/\d+\s+(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)/)) {
                    break;
                }
                if (line.match(/วันออกบัตร|วันบัตรหมดอายุ|Date of/i)) {
                    addressLines.pop();
                    break;
                }
            }
        }
        if (addressLines.length > 0) {
            result.address = addressLines.join(' ').replace(/\s+/g, ' ').trim();
        }
    }

    return result;
}

// Parse Passport
export function parsePassport(text: string): {
    passport?: string;
    firstName?: string;
    lastName?: string;
    passportExpiry?: string;
} {
    const result: any = {};

    // Passport number (usually alphanumeric, 6-9 characters)
    const passportMatch = text.match(/(?:Passport\s*(?:No|Number)?[:\s]*)?([A-Z]{1,2}\d{6,8})/i);
    if (passportMatch) {
        result.passport = passportMatch[1].toUpperCase();
    }

    // Alternative: Just find any pattern that looks like passport number
    if (!result.passport) {
        const altMatch = text.match(/[A-Z]{1,2}\d{6,8}/);
        if (altMatch) {
            result.passport = altMatch[0];
        }
    }

    // Extract name from MRZ line (Machine Readable Zone)
    const mrzMatch = text.match(/([A-Z]+)<<([A-Z]+)/);
    if (mrzMatch) {
        result.lastName = mrzMatch[1].replace(/</g, ' ').trim();
        result.firstName = mrzMatch[2].replace(/</g, ' ').trim();
    }

    // Try to extract expiry date
    const expiryMatch = text.match(/(?:Expiry|Exp|Date\s*of\s*Expiry)[:\s]*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/i);
    if (expiryMatch) {
        const day = expiryMatch[1].padStart(2, '0');
        const month = expiryMatch[2].padStart(2, '0');
        const year = expiryMatch[3];
        result.passportExpiry = `${year}-${month}-${day}`;
    }

    return result;
}

// Cleanup function
export async function terminateOCRWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}
