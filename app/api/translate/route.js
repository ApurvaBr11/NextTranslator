import { NextResponse } from 'next/server';
import axios from 'axios';

const LIBRETRANSLATE_URL = 'https://libretranslate.de/translate';

export async function POST(req) {
  try {
    const { q, source, target } = await req.json();

    // Create the URLSearchParams object
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('source', source);
    params.append('target', target);

    // Make the POST request to LibreTranslate
    const response = await axios.post(LIBRETRANSLATE_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error translating:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
