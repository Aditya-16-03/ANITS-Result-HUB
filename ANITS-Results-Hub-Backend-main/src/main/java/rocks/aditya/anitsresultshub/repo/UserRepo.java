package rocks.aditya.anitsresultshub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rocks.aditya.anitsresultshub.models.BaseUser;

@Repository
public interface UserRepo extends JpaRepository<BaseUser, String> {

    BaseUser getBaseUsersByEmail(String email);

    BaseUser getBaseUserByEmail(String email);
}
