package com.aditya.bro.ai.service;

import com.aditya.bro.ai.dto.QueryHistory;
import java.util.List;

public interface QueryHistoryService {
    List<QueryHistory> getQueryHistory(int page, int size);
    QueryHistory saveQuery(QueryHistory query);
    void deleteQuery(String id);
}