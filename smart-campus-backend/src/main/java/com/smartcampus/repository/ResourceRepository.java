package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(Resource.ResourceType type);
    List<Resource> findByStatus(Resource.ResourceStatus status);
    List<Resource> findByLocation(String location);
    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);

    @Query("{ 'capacity': { $gte: ?0 }, 'status': 'ACTIVE' }")
    List<Resource> findByMinCapacityAndActive(int minCapacity);

    @Query("{ $and: [ " +
           "{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } } ] }, " +
           "{ 'status': { $ne: 'OUT_OF_SERVICE' } } ] }")
    List<Resource> searchResources(String keyword);
}
