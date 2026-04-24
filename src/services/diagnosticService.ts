import apiClient from './apiClient';

export interface DiagnosticRequestPayload {
  schoolName: string;
  contactEmail: string;
  cohortClass: string;
  studentCount: number;
  notes?: string;
}

export const diagnosticService = {
  /** Submit a free-diagnostic request for a cohort of 10–30 students. */
  requestDiagnostic: async (payload: DiagnosticRequestPayload): Promise<{ ok: true }> => {
    const { data } = await apiClient.post<{ ok: true }>('/diagnostic/request', payload);
    return data;
  },
};
