package rocks.vivek275.anitsresultshub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rocks.vivek275.anitsresultshub.models.BaseUser;

@Repository
public interface UserRepo extends JpaRepository<BaseUser, String> {

    BaseUser getBaseUsersByEmail(String email);

    BaseUser getBaseUserByEmail(String email);
}
