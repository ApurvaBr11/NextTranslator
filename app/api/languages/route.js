import { NextResponse } from 'next/server';
import axios from 'axios';

const LIBRETRANSLATE_LANGUAGES_URL = 'https://libretranslate.de/languages';

export async function GET() {
  try {
    const response = await axios.get(LIBRETRANSLATE_LANGUAGES_URL, {
      headers: {
        'accept': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
