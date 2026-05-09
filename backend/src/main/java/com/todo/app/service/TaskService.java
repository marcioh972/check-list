package com.todo.app.service;

import com.todo.app.model.Task;
import com.todo.app.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    public List<Task> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public List<Task> getByStatus(boolean done) {
        return repo.findByDoneOrderByCreatedAtDesc(done);
    }

    public Task create(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Texto da tarefa não pode ser vazio.");
        }
        return repo.save(new Task(text.trim()));
    }

    public Task toggle(Long id) {
        Task task = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + id));
        task.setDone(!task.isDone());
        return repo.save(task);
    }

    public Task updateText(Long id, String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Texto da tarefa não pode ser vazio.");
        }
        Task task = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada: " + id));
        task.setText(text.trim());
        return repo.save(task);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Tarefa não encontrada: " + id);
        }
        repo.deleteById(id);
    }

    public void clearDone() {
        List<Task> done = repo.findByDoneOrderByCreatedAtDesc(true);
        repo.deleteAll(done);
    }
}