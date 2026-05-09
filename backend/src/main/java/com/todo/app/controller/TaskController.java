package com.todo.app.controller;

import com.todo.app.model.Task;
import com.todo.app.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173") // Vite dev server
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // GET /api/tasks          → todas as tarefas
    // GET /api/tasks?filter=active  → pendentes
    // GET /api/tasks?filter=done    → concluídas
    @GetMapping
    public List<Task> list(@RequestParam(required = false) String filter) {
        if ("active".equals(filter)) return service.getByStatus(false);
        if ("done".equals(filter))   return service.getByStatus(true);
        return service.getAll();
    }

    // POST /api/tasks  { "text": "..." }
    @PostMapping
    public ResponseEntity<Task> create(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        Task created = service.create(text);
        return ResponseEntity.status(201).body(created);
    }

    // PATCH /api/tasks/{id}/toggle
    @PatchMapping("/{id}/toggle")
    public Task toggle(@PathVariable Long id) {
        return service.toggle(id);
    }

    // PATCH /api/tasks/{id}  { "text": "..." }
    @PatchMapping("/{id}")
    public Task updateText(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.updateText(id, body.get("text"));
    }

    // DELETE /api/tasks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/tasks/done
    @DeleteMapping("/done")
    public ResponseEntity<Void> clearDone() {
        service.clearDone();
        return ResponseEntity.noContent().build();
    }
}