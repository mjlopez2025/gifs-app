  import { Injectable, computed, inject, signal } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '@environments/environment';
  import { GiphyResponse } from '../interfaces/giphy.interfaces';
  import { GifMapper } from '../mapper/gif.mapper';
  import { Gif } from '../interfaces/gif.interface';
  import { map, Observable, tap } from 'rxjs';

  @Injectable({providedIn: 'root'})
  export class GifService {

    private http = inject(HttpClient);

    trendingGifs = signal<Gif[]>([])
    trendingGifsLoading = signal(true);

    searchHistory = signal<Record<string, Gif[]>>({});
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));


    constructor() {
      this.loadTrendingGifs();
    }


    loadTrendingGifs() {
      this.http.get<GiphyResponse>(`${ environment.giphyUrl }/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.set(gifs);
        this.trendingGifsLoading.set(false);
        console.log({gifs});
      });
    }

    searchGifs(query: string): Observable<Gif[]> {
      return this.http.get<GiphyResponse>(`${ environment.giphyUrl }/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          q: query,
        },
      })
      .pipe(
        map(({ data }) => data),
        map(( items ) => GifMapper.mapGiphyItemsToGifArray(items)),

        //historial
        tap((items) => {
          this.searchHistory.update((history) => ({
            ...history,
            [query.toLowerCase()]: items,
          }));
        })
      );
      // .subscribe((resp) => {
      //   const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      //   console.log({search: gifs});
      // });
    }

    getHistoryGifs( query: string) {
      return this.searchHistory()[query] ?? [];
    }
  }

