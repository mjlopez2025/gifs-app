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
    trendingGifsLoading = signal(false);
    private trendingPage = signal(0);

    trendingGifGroup = computed<Gif[][]>(() => {
      const groups = [];
      for(let i = 0; i < this.trendingGifs().length; i +=3) {
        groups.push(this.trendingGifs().slice(i, i + 3));
      }
      return groups;
    })

    searchHistory = signal<Record<string, Gif[]>>({});
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    constructor() {
      this.loadTrendingGifs();
    }

    loadTrendingGifs() {
      if(this.trendingGifsLoading()) return;
      this.trendingGifsLoading.set(true);


      this.http.get<GiphyResponse>(`${ environment.giphyUrl }/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          offset: this.trendingPage() * 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.update(currentGifs => [
          ...currentGifs,
          ...gifs
        ]);
        this.trendingPage.update((page) => page + 1);
        this.trendingGifsLoading.set(false);
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

