using TesteTecnicoPlaymove.Infra;
using System.Data;
using System.Reflection;
using System.Text;

namespace TesteTecnicoPlaymove.Entities
{
    public class Entity : IEntity
    {
        [Column("id")]
        public int Id { get; set; }

        protected string? table { get; set; }


        public Entity()
        {
            Id = -2;
        }

        public bool Delete()
        {
            var query = new StringBuilder()
                .Append($"DELETE FROM {table}")
                .Append($" WHERE id = {Id}")
                .ToString();

            return new DBConnection().Execute(query) > 0;
        }

        public virtual void MapEntity(DataRow dataRow)
        {
            Id = Convert.ToInt32(dataRow["id"]);
        }

        public bool IdAlreadyExists(int id)
        {
            var query = new StringBuilder()
              .Append($"SELECT COUNT(*) FROM {table}")
              .Append($" WHERE id = {id}")
              .ToString();

            var result = Convert.ToInt32(new DBConnection().SelectScalar(query));

            return result > 0;
        }

        public IEntity? GetById(int id) => GetByField("id", id);

        public IEntity? GetByLikeness(string field, object value)
        {
            var query = new StringBuilder()
                .Append($"SELECT * FROM {table}")
                .Append($" WHERE {field} like \'%{value.ToString()}%\'")
                .ToString();

            return SelectAndMap(query);
        }

        public IEntity? GetByField(string field, object value)
        {
            var query = new StringBuilder()
                .Append($"SELECT * FROM {table}")
                .Append($" WHERE {field} = {value.ToString()}")
                .ToString();

            return SelectAndMap(query);
        }

        private IEntity? SelectAndMap(string query)
        {
            var result = new DBConnection().Select(query).Rows;

            if (result.Count > 0)
            {
                var entity = (IEntity?)Activator.CreateInstance(GetType());
                entity?.MapEntity(result[0]);
                return entity;
            }

            return null;
        }

        public IEnumerable<IEntity> GetAllMapped()
        {
            var query = new StringBuilder()
                .Append($"SELECT * FROM {table}")
                .ToString();

            var result = new DBConnection().Select(query).Rows;

            foreach (DataRow dataRow in result)
            {
                var entity = (IEntity?)Activator.CreateInstance(GetType());
                entity?.MapEntity(dataRow);

                if (entity != null)
                    yield return entity;
            }
        }
        public int GetEntityCount(string queryParam = "")
        {
            var query = new StringBuilder()
                .Append($"SELECT COUNT(*) FROM {table}");

            if (queryParam != "" && queryParam != "none")
            {
                var filter = (ReplaceQuotes(queryParam)).Split('|');
                query.Append($" WHERE {filter[0]} like '%{filter[1]}%'");
            }

            var result = new DBConnection().SelectScalar(query.ToString());

            return Convert.ToInt32(result);
        }

        public IEnumerable<IEntity> GetAllMappedAndPaginated(int currentPage, int itemsPerPage, string queryParam = "")
        {
            var offset = (currentPage * itemsPerPage) - (itemsPerPage);
            var limit = (itemsPerPage);
            var query = new StringBuilder()
                .Append($"SELECT * FROM {table}");

            if (queryParam != "" && queryParam != "none")
            {
                var filter = (ReplaceQuotes(queryParam)).Split('|');
                query.Append($" WHERE {filter[0]} like '%{filter[1]}%'");
            }

            query.Append($" LIMIT {limit} OFFSET {offset} ");

            var result = new DBConnection().Select(query.ToString()).Rows;

            foreach (DataRow dataRow in result)
            {
                var entity = (IEntity?)Activator.CreateInstance(GetType());
                entity?.MapEntity(dataRow);

                if (entity != null)
                    yield return entity;
            }
        }

        public bool Save()
        {
            if (Id == -2)
                return Insert();

            return Update();
        }

        private bool Insert()
        {
            try
            {
                var properties = GetType().GetProperties().Where(property => property.Name != "Id");
                SetupColumnsToUpdate(properties, out Dictionary<string, string> valuesToUpdate);

                var query = new StringBuilder()
                    .Append($"INSERT INTO {table}")
                    .Append($" ({string.Join(',', valuesToUpdate.Keys)}) ")
                    .Append($"VALUES ({string.Join(',', valuesToUpdate.Values)}) ");

                Id = new DBConnection().ExecuteAndReturnLastId(query.ToString());

                return Id != -2;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        private bool Update()
        {
            try
            {
                var properties = GetType().GetProperties().Where(property => property.Name != "Id");
                SetupColumnsToUpdate(properties, out Dictionary<string, string> valuesToUpdate);

                var query = new StringBuilder()
                    .Append($"UPDATE {table}")
                    .Append(" SET ");

                var updates = new StringBuilder();

                foreach (var valueToUpdate in valuesToUpdate)
                    updates.Append($" {valueToUpdate.Key} = {valueToUpdate.Value},");

                query.Append(updates.ToString().TrimEnd(','))
                     .Append($" WHERE id = {Id}");

                new DBConnection().Execute(query.ToString());

                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        private bool SetupColumnsToUpdate(IEnumerable<PropertyInfo> properties, out Dictionary<string, string> valuesToUpdate)
        {
            valuesToUpdate = new Dictionary<string, string>();

            foreach (var property in properties)
            {
                var column = (Column?)property.GetCustomAttributes(typeof(Column), true).FirstOrDefault();
                var propertyValue = property.GetValue(this);

                if (column == null || propertyValue == null)
                    continue;


                if (property.PropertyType.IsEnum)
                {
                    valuesToUpdate.Add(column.ColumnName, Convert.ToInt32(propertyValue).ToString());
                    continue;
                }

                if (propertyValue is string propertyValueAsString)
                {
                    valuesToUpdate.Add(column.ColumnName, $"\'{ReplaceQuotes(propertyValueAsString)}\'");
                    continue;
                }

                if (propertyValue is int propertyValueAsInt)
                {
                    valuesToUpdate.Add(column.ColumnName, propertyValueAsInt.ToString());
                    continue;
                }

                if (propertyValue is DateTime propertyValueAsDateTime)
                {
                    valuesToUpdate.Add(column.ColumnName, $"\'{propertyValueAsDateTime.ToString("yyyy-MM-dd HH:mm:ss")}\'");
                    continue;
                }

                valuesToUpdate.Add(column.ColumnName, $"\'{ReplaceQuotes(propertyValue.ToString())}\'");

            }

            return valuesToUpdate.Any();

        }

        public string ReplaceQuotes(string text)
        {
            return text.Replace("'", "''").Replace("\"", "\\\"");
        }

    }
}
