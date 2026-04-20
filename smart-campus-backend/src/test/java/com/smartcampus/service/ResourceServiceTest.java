package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceService Unit Tests")
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource testResource;

    @BeforeEach
    void setUp() {
        testResource = Resource.builder()
                .id("res-001")
                .name("Lab A201")
                .type(Resource.ResourceType.LAB)
                .capacity(30)
                .location("Block A, Floor 2")
                .status(Resource.ResourceStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should return resource by valid ID")
    void getResourceById_ValidId_ReturnsResource() {
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));

        Resource result = resourceService.getResourceById("res-001");

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Lab A201");
        assertThat(result.getType()).isEqualTo(Resource.ResourceType.LAB);
        verify(resourceRepository).findById("res-001");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for unknown ID")
    void getResourceById_InvalidId_ThrowsException() {
        when(resourceRepository.findById("invalid")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById("invalid"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Resource not found");
    }

    @Test
    @DisplayName("Should create and save a new resource")
    void createResource_ValidResource_ReturnsSavedResource() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(testResource);

        Resource result = resourceService.createResource(testResource);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("res-001");
        verify(resourceRepository).save(testResource);
    }

    @Test
    @DisplayName("Should update resource status")
    void updateResourceStatus_ValidStatus_UpdatesResource() {
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));
        when(resourceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Resource updated = resourceService.updateResourceStatus("res-001", Resource.ResourceStatus.OUT_OF_SERVICE);

        assertThat(updated.getStatus()).isEqualTo(Resource.ResourceStatus.OUT_OF_SERVICE);
    }

    @Test
    @DisplayName("Should return all resources when no filters applied")
    void getAllResources_NoFilters_ReturnsAll() {
        when(resourceRepository.findAll()).thenReturn(List.of(testResource));

        List<Resource> result = resourceService.getAllResources(null, null, null, null, null);

        assertThat(result).hasSize(1);
        verify(resourceRepository).findAll();
    }

    @Test
    @DisplayName("Should filter resources by type")
    void getAllResources_WithTypeFilter_ReturnsFiltered() {
        when(resourceRepository.findByType(Resource.ResourceType.LAB)).thenReturn(List.of(testResource));

        List<Resource> result = resourceService.getAllResources("LAB", null, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo(Resource.ResourceType.LAB);
    }

    @Test
    @DisplayName("Should delete resource by ID")
    void deleteResource_ValidId_DeletesResource() {
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));
        doNothing().when(resourceRepository).delete(any());

        assertThatCode(() -> resourceService.deleteResource("res-001"))
                .doesNotThrowAnyException();

        verify(resourceRepository).delete(testResource);
    }
}
