/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface AutocompleteResultItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  rawSuggestion: google.maps.places.AutocompleteSuggestion;
}

export function usePlacesAutocomplete(inputString: string) {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placesLib) return;

    if (!inputString.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const debounceTimer = setTimeout(() => {
      const request: google.maps.places.AutocompleteRequest = {
        input: inputString,
        sessionToken: sessionTokenRef.current ?? undefined,
      };

      AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        .then((response: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
          if (!isMounted) return;
          const items: AutocompleteResultItem[] = (response.suggestions || []).map(
            (s: google.maps.places.AutocompleteSuggestion) => ({
              placeId: s.placePrediction?.placeId || Math.random().toString(),
              mainText: s.placePrediction?.mainText?.text || s.placePrediction?.text?.text || '',
              secondaryText: s.placePrediction?.secondaryText?.text || '',
              fullText: s.placePrediction?.text?.text || '',
              rawSuggestion: s,
            })
          );
          setSuggestions(items);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          console.error('Error fetching autocomplete suggestions:', err);
          const errString = String(err);
          if (errString.includes('OverQuota') || errString.includes('RESOURCE_EXHAUSTED')) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
          setError('Unable to load place suggestions');
          setIsLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [placesLib, inputString]);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    resetSession,
  };
}
