package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources(String type, String status, String location,
                                          Integer minCapacity, String keyword) {
        if (StringUtils.hasText(keyword)) {
            return resourceRepository.searchResources(keyword);
        }
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(
                    Resource.ResourceType.valueOf(type),
                    Resource.ResourceStatus.valueOf(status));
        }
        if (type != null) {
            return resourceRepository.findByType(Resource.ResourceType.valueOf(type));
        }
        if (status != null) {
            return resourceRepository.findByStatus(Resource.ResourceStatus.valueOf(status));
        }
        if (location != null) {
            return resourceRepository.findByLocation(location);
        }
        if (minCapacity != null) {
            return resourceRepository.findByMinCapacityAndActive(minCapacity);
        }
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource createResource(Resource resource) {
        log.info("Creating new resource: {}", resource.getName());
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);
        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setDescription(updatedResource.getDescription());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
        existing.setStatus(updatedResource.getStatus());
        if (updatedResource.getImageUrl() != null) {
            existing.setImageUrl(updatedResource.getImageUrl());
        }
        log.info("Updating resource: {}", id);
        return resourceRepository.save(existing);
    }

    public Resource updateResourceStatus(String id, Resource.ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
        log.info("Deleted resource: {}", id);
    }
}
